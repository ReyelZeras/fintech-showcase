package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.dto.request.TransferRequestDTO;
import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.entity.Transaction;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.event.TransactionEvent;
import com.fintech.showcase.wallet_api.mapper.WalletMapper;
import com.fintech.showcase.wallet_api.repository.TransactionRepository;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    @Spy
    private WalletMapper walletMapper;

    @InjectMocks
    private WalletService walletService;

    private Wallet originWallet;
    private Wallet destinationWallet;
    private UUID originId;
    private UUID destinationId;

    @BeforeEach
    void setUp() {
        originId = UUID.randomUUID();
        destinationId = UUID.randomUUID();

        originWallet = Wallet.builder()
                .id(originId)
                .ownerName("Reyel Soares")
                .balance(new BigDecimal("1000.00"))
                .build();

        destinationWallet = Wallet.builder()
                .id(destinationId)
                .ownerName("John Doe")
                .balance(new BigDecimal("200.00"))
                .build();
    }

    @Test
    @DisplayName("Deve transferir saldo com sucesso entre duas carteiras distintas")
    void transferWithSuccess() {
        TransferRequestDTO request = new TransferRequestDTO(originId, destinationId, new BigDecimal("300.00"));

        when(walletRepository.findById(originId)).thenReturn(Optional.of(originWallet));
        when(walletRepository.findById(destinationId)).thenReturn(Optional.of(destinationWallet));

        assertDoesNotThrow(() -> walletService.transfer(request));

        assertEquals(new BigDecimal("700.00"), originWallet.getBalance());
        assertEquals(new BigDecimal("500.00"), destinationWallet.getBalance());

        verify(walletRepository).save(originWallet);
        verify(walletRepository).save(destinationWallet);
        verify(transactionRepository, times(2)).save(any(Transaction.class));
        verify(kafkaTemplate).send(eq("audit-events"), anyString(), any(TransactionEvent.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando o saldo da carteira de origem for insuficiente")
    void transferWithInsufficientBalanceException() {
        TransferRequestDTO request = new TransferRequestDTO(originId, destinationId, new BigDecimal("1500.00"));

        when(walletRepository.findById(originId)).thenReturn(Optional.of(originWallet));

        // Foca no tipo da exceção lançada pela sua regra de negócio
        assertThrows(RuntimeException.class, () -> walletService.transfer(request));

        // Garante que o fluxo foi interrompido e nenhuma entidade foi persistida ou enviada ao Kafka
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(kafkaTemplate, never()).send(anyString(), anyString(), any(TransactionEvent.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando IDs de origem e destino forem idênticos")
    void transferWithSameAccountsException() {
        TransferRequestDTO request = new TransferRequestDTO(originId, originId, new BigDecimal("50.00"));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> walletService.transfer(request));
        assertEquals("Origem e destino não podem ser iguais", exception.getMessage());

        verify(walletRepository, never()).findById(any(UUID.class));
    }

    @Test
    @DisplayName("Deve realizar depósito com sucesso e incrementar saldo")
    void depositWithSuccess() {
        BigDecimal depositAmount = new BigDecimal("250.50");
        when(walletRepository.findById(originId)).thenReturn(Optional.of(originWallet));

        WalletResponseDTO response = walletService.deposit(originId, depositAmount);

        assertEquals(new BigDecimal("1250.50"), originWallet.getBalance());
        verify(walletRepository).save(originWallet);
        verify(transactionRepository).save(any(Transaction.class));
        assertEquals("Reyel Soares", response.ownerName());
        assertEquals(new BigDecimal("1250.50"), response.balance());
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar depositar em carteira inexistente")
    void depositWithWalletNotFoundException() {
        UUID randomId = UUID.randomUUID();
        when(walletRepository.findById(randomId)).thenReturn(Optional.empty());

        // Foca na validação do disparo da exceção
        assertThrows(RuntimeException.class, () -> walletService.deposit(randomId, new BigDecimal("100.00")));

        // Garante que nenhuma operação de escrita ocorreu
        verify(walletRepository, never()).save(any(Wallet.class));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}