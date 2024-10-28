package com.example.application.game;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

//import com.example.application.player.Player;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GameState {
  @Id
  private Long gameId;
  private String topDiscardCard;
  private boolean isGameOver;
  private boolean canBePlayed;
  // private Player currentPlayer;

  public String toJson() throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    return objectMapper.writeValueAsString(this);
  }
}
