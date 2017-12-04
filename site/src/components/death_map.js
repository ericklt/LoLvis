import React from 'react';
import {Link} from 'react-router-dom';
import './deaths.js';
import './deaths.css';
import $ from 'jquery';

class DeathMap extends React.Component {

  componentDidMount() {
    this.deathsSetup();
  }

  render() {
    return(
      <div className="container champs-container">
        <div className="graphics-container">
          <div className='deaths-visualization'>
            <div className='canvas-container'>
              <img className='canvas-class' width="400" height="400" src="../static/images/samuels_rif.png"></img>
              <canvas className='canvas canvas-class' width="400" height="400"></canvas>
            </div>
            <div className='deaths-chart'>
              <h4>Mortes</h4>
              <div className='team-bar'>
                <div className='blue-bar death-bar'>
                  <span className='blue-span team-span'>0</span>
                </div>
              </div>
              <div className='team-bar'>
                <div className='red-bar death-bar'>
                  <span className='red-span team-span'>0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="progress-bar">
            <button className="player-button" onclick="playerButtonPress()"></button>
            <div className="slidecontainer">
              <input type="range" min="0" max="0" value="0" step="1" className="slider myRange" onmousemove="onSlideChange()" onclick="pausePlaying()" />
            </div>
            <span className="slider-time">00:00</span>
          </div>
        </div>
      </div>
    );
  }
}

export default DeathMap;
