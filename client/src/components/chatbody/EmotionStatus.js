import React from 'react';

const EmotionStatus = ({ emotion }) => {
  const isHappy = emotion.Happy === 1 ? 'true' : 'false';
  const isAngry = emotion.Angry === 1 ? 'true' : 'false';
  const isSurprise = emotion.Surprise === 1 ? 'true' : 'false';
  const isSad = emotion.Sad === 1 ? 'true' : 'false';
  const isFear = emotion.Fear === 1 ? 'true' : 'false';

  return (
    <div>
      <p>Happy: {isHappy}</p>
      <p>Angry: {isAngry}</p>
      <p>Surprise: {isSurprise}</p>
      <p>Sad: {isSad}</p>
      <p>Fear: {isFear}</p>
    </div>
  );
};

export default EmotionStatus;
