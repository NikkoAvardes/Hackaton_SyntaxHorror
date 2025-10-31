import React from 'react';

const CuteContent = () => {
  return (
    <div className="cute">
      <h1>Bienvenue sur mon site mignon!</h1>
      <p>Regarde ces petits chats et licornes 🐱🦄</p>
      <img src="https://placekitten.com/300/300" alt="cute kitten"/>
      
      <div style={{ height: '100vh', padding: '50px' }}>
        <h2>Faites défiler vers le bas... 👇</h2>
        <p>🌸 Des fleurs jolies 🌸</p>
        <p>🦋 Des papillons colorés 🦋</p>
        <p>🌈 Un arc-en-ciel magique 🌈</p>
        <p>✨ Des étoiles scintillantes ✨</p>
        <br/>
        <p>Continuez à faire défiler... quelque chose va changer... 😈</p>
      </div>
      
      <div style={{ height: '50vh', padding: '20px' }}>
        <p>Encore un peu... 👇</p>
        <p>🎈 Des ballons 🎈</p>
        <p>🍭 Des bonbons 🍭</p>
      </div>
    </div>
  );
};

export default CuteContent;
