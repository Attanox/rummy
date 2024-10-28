import { TRank, TSuit } from 'Frontend/types';

const PlayingCard = ({
  rank,
  suit,
}: {
  rank: TRank;
  suit: TSuit;
}) => {
  const suitSymbols: {
    [key in TSuit]: string;
  } = {
    H: '♥',
    D: '♦',
    C: '♣',
    S: '♠',
  };

  // Check if the card is a Joker
  const isJoker = rank === 'JOKER';

  const styles: Record<string, React.CSSProperties> = {
    card: {
      width: '70px',
      height: '100px',
      border: '1px solid #333',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px',
      fontFamily: 'Arial, sans-serif',
      cursor: 'grab',
      color: suit === 'H' || suit === 'D' ? '#d32f2f' : '#000',
      marginRight: '-15px',
    },
    rank: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    suit: {
      fontSize: '14px',
    },
    bottomRank: {
      fontSize: '16px',
      fontWeight: 'bold',
      transform: 'rotate(180deg)'
    },
    joker: {
      fontSize: '16px', // Reduced font size to fit within the card
      fontWeight: 'bold',
      writingMode: 'vertical-rl',
      textOrientation: 'upright',
      letterSpacing: '1px', // Adjusted spacing for better fit
      lineHeight: '1', // Adjusted line height to fit within the card
      whiteSpace: 'nowrap', // Prevents wrapping and keeps text within bounds
      overflow: 'hidden', // Ensures text does not overflow
    },
  };

  return (
    <div style={styles.card}>
      {isJoker ? (
        <div style={styles.joker}>JOKER</div>
      ) : (
        <>
          <div style={styles.rank}>{rank}</div>
          <div style={styles.suit}>{suitSymbols[suit]}</div>
          <div style={styles.bottomRank}>{rank}</div>
        </>
      )}
    </div>
  );
};

export default PlayingCard;
