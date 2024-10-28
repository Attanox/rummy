package com.example.application.handler;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketHandler extends TextWebSocketHandler {

  private static Set<WebSocketSession> sessions = new HashSet<>();

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    // Add new session to the set
    sessions.add(session);
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    // Handle incoming messages (if needed)
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status)
      throws Exception {
    // Remove session when WebSocket connection is closed
    sessions.remove(session);
  }

  public void sendGameState(String msg) {
    TextMessage message = new TextMessage(msg);
    System.out.println("sessions");
    System.out.println(sessions);
    for (WebSocketSession session : sessions) {
      try {
        if (session.isOpen()) {
          session.sendMessage(message);
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
