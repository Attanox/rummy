package com.example.application.game;

import com.example.application.handler.WebSocketHandler;
import com.example.application.player.Player;
import com.example.application.player.PlayerRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@BrowserCallable
@AnonymousAllowed
@Service
public class GameService {

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  private PlayerRepository playerRepository;

  @Autowired
  private WebSocketHandler gameWebSocketHandler;

  public Game createGame(Integer capacity) {
    Game newGame = new Game();
    newGame.setPlayers(new ArrayList<>());
    newGame.setCapacity(capacity);
    initializeDeck(newGame);
    return gameRepository.save(newGame);
  }

  private List<String> getPlayerHand(Player player, Game game) {
    List<String> playerHand = new ArrayList<>();
    int CARDS_PER_PLAYER = 14;
    for (int i = 0; i < CARDS_PER_PLAYER; i++) {
      playerHand.add(game.getDrawPile().remove(0));
    }
    return playerHand;
  }

  private Player createPlayer(String name, Game game) {
    Player player = new Player();
    player.setName(name);
    player.setHand(this.getPlayerHand(player, game));
    // player.setGame(game);
    playerRepository.save(player);
    return player;
  }

  public Player addPlayer(Long gameId, String name) throws JsonProcessingException {
    Game game = this.getGame(gameId);
    List<Player> currentPlayers = game.getPlayers();
    Player player = this.createPlayer(name, game);
    currentPlayers.add(player);
    game.setPlayers(currentPlayers);
    gameRepository.save(game);
    GameState gameState = this.getGameState(game);
    this.notifyClients(gameState);
    return player;
  }

  private List<Player> removePlayerById(List<Player> currentPlayers, Long id) {
    return currentPlayers.stream()
                          .filter(player -> player.getId() != id)
                          .collect(Collectors.toList());
  }

  public List<Player> removePlayer(Long gameId, Long id) throws JsonProcessingException {
    Game game = this.getGame(gameId);
    List<Player> currentPlayers = game.getPlayers();
    game.setPlayers(removePlayerById(currentPlayers, id));
    gameRepository.save(game);
    GameState gameState = this.getGameState(game);
    this.notifyClients(gameState);
    return currentPlayers;
  }

  private void initializeDeck(Game game) {
    List<String> deck = new ArrayList<>();
    String[] suits = { "H", "D", "C", "S" };
    String[] ranks = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" };
    int DECKS = 2;
    for (int i = 0; i < DECKS; i++) { // we're using multiple decks
      for (String suit : suits) {
        for (String rank : ranks) {
          deck.add(rank + suit);
        }
      }
    }

    for (int i = 0; i < 3; i++) {
      deck.add("JOKER");
    }

    Collections.shuffle(deck);
    game.setDrawPile(deck);
    game.setDiscardPile(new ArrayList<>());
  }

  public Game getGame(Long id) {
    return gameRepository.findById(id).orElseThrow(() -> new RuntimeException("Game not found"));
  }

  // Example method to start the game
  public Game startGame(Long gameId) throws JsonProcessingException {
    Game game = this.getGame(gameId);
    GameState gameState = this.getGameState(game);
    this.notifyClients(gameState);
    return this.getGame(gameId);
  }

  private <T> T getLastElement(List<T> list) {
    if (list == null || list.isEmpty()) {
      return null; // Return null if list is null or empty
    } else {
      return list.getLast(); // Return the last element
    }
  }

  private GameState getGameState(Game game) {
    GameState gameState = GameState
        .builder()
        .isGameOver(game.getIsGameOver())
        // .currentPlayer(game.getCurrentPlayer())
        .gameId(game.getId())
        .topDiscardCard(getLastElement(game.getDiscardPile()))
        .canBePlayed(game.getPlayers().size() == game.getCapacity())
        .build();
    return gameState;
  }

  // Notify clients via WebSocket
  private void notifyClients(GameState gameState) throws JsonProcessingException {
    gameWebSocketHandler.sendGameState(gameState.toJson().toString());
  }

}
