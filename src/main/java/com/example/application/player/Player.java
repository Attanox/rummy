package com.example.application.player;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

import com.example.application.game.Game;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Player implements Serializable {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  @ElementCollection
  private List<String> hand;

  @ElementCollection
  private List<List<String>> table;

  @ManyToOne
  @JoinColumn(name = "game_id")
  private Game game;
}
