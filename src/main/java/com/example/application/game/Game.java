package com.example.application.game;

import com.example.application.player.Player;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Game {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "game_id")
  private List<Player> players;

  @ElementCollection
  private List<String> drawPile;

  @ElementCollection
  private List<String> discardPile;

  private Boolean isGameOver = false;

  private Player currentPlayer;

  private Integer capacity;
}
