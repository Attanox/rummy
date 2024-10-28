import React from 'react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { GameService } from 'Frontend/generated/endpoints.js';
import { Link } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { order: 0, icon: 'line-awesome/svg/globe-solid.svg' },
  title: 'Create Game',
};

const styles = {
  section: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '300px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    width: '100%',
    margin: '10px 0',
  },
  valueDisplay: {
    marginTop: '10px',
    fontSize: '18px',
    color: '#333',
    fontWeight: 'bold',
  },
  value: {
    color: '#007bff',
    fontSize: '24px',
  },
  submitButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default function HelloWorldView() {
  const MIN_PLAYERS = 1;
  const MAX_PLAYERS = 4;
  const [numPlayers, setNumPlayers] = React.useState(MIN_PLAYERS);
  const [gameLink, setGameLink] = React.useState<string>('');

  const handleSliderChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNumPlayers(parseInt(event.target.value));
  };

  const getGameLink = (gameId: number) => {
    return `game/${gameId}`;
  };

  const onFormSubmit: React.DOMAttributes<HTMLFormElement>['onSubmit'] =
    async (e) => {
      e.preventDefault();
      const createdGame = await GameService.createGame(numPlayers);
      if (!createdGame?.id) return;
      setGameLink(getGameLink(createdGame.id));
    };

  return (
    <section style={styles.section}>
      <form onSubmit={onFormSubmit}>
        <div style={styles.container}>
          <h2 style={styles.heading}>Create a Rummy Game</h2>
          <div style={styles.sliderContainer}>
            <input
              type="range"
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              value={numPlayers}
              onChange={handleSliderChange}
              style={styles.slider}
            />
            <div style={styles.valueDisplay}>
              <span style={styles.value}>{numPlayers}</span> Player
              {numPlayers > 1 && 's'}
            </div>
          </div>
          {gameLink ? (
            <Link style={{ marginTop: '10px' }} to={gameLink}>
              {`${window.location.href}${gameLink}`}
            </Link>
          ) : (
            <button type="submit" style={styles.submitButton}>
              Create game
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
