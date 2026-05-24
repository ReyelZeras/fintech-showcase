package com.fintech.showcase.wallet_api.service;

import com.fintech.showcase.wallet_api.dto.request.TransferRequestDTO;
import com.fintech.showcase.wallet_api.dto.response.WalletResponseDTO;
import com.fintech.showcase.wallet_api.entity.Transaction;
import com.fintech.showcase.wallet_api.entity.User;
import com.fintech.showcase.wallet_api.entity.Wallet;
import com.fintech.showcase.wallet_api.event.TransactionEvent;
import com.fintech.showcase.wallet_api.mapper.WalletMapper;
import com.fintech.showcase.wallet_api.repository.TransactionRepository;
import com.fintech.showcase.wallet_api.repository.UserRepository;
import com.fintech.showcase.wallet_api.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
    private UserRepository userRepository; // Adicionado para a busca da Chave Pix
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private WalletMapper walletMapper; // Injetado para evitar NullPointer e warnings

    @InjectMocks
    private WalletService walletService;

    private UUID originId;
    private Wallet originWallet;
    private User destinationUser;
    private Wallet destinationWallet;

    @BeforeEach
    void setUp() {
        originId = UUID.randomUUID();
        originWallet = Wallet.builder()
                .id(originId)
                .ownerName("Reyel Soares")
                .balance(new BigDecimal("1000.00"))
                .active(true)
                .build();

        destinationWallet = Wallet.builder()
                .id(UUID.randomUUID())
                .ownerName("John Doe")
                .balance(new BigDecimal("200.00"))
                .active(true)
                .build();

        destinationUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("John Doe")
                .pixKey("john@email.com")
                .wallet(destinationWallet)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Deve transferir saldo com sucesso utilizando a Chave Pix")
    void transferWithSuccess() {
        TransferRequestDTO request = new TransferRequestDTO(originId, "john@email.com", new BigDecimal("300.00"));

        when(walletRepository.findById(originId)).thenReturn(Optional.of(originWallet));
        when(userRepository.findByPixKey("john@email.com")).thenReturn(Optional.of(destinationUser));

        assertDoesNotThrow(() -> walletService.transfer(request));

        assertEquals(new BigDecimal("700.00"), originWallet.getBalance());
        assertEquals(new BigDecimal("500.00"), destinationWallet.getBalance());
        verify(transactionRepository, times(2)).save(any(Transaction.class));
        verify(kafkaTemplate).send(eq("audit-events"), anyString(), any(TransactionEvent.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando a Chave Pix não for encontrada")
    void transferWithPixNotFoundException() {
        TransferRequestDTO request = new TransferRequestDTO(originId, "chave-inexistente", new BigDecimal("300.00"));

        when(walletRepository.findById(originId)).thenReturn(Optional.of(originWallet));
        when(userRepository.findByPixKey("chave-inexistente")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> walletService.transfer(request));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}