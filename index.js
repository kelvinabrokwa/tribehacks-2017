/**
 * Frontend
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { characteristicNames, serviceNames } from './names';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: 0,
      light: 0,
      lock: false,
      noise: 0,
      cookieJar: true
    }
  }
  componentDidMount() {
    var socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('message', e => {
      try {
        var data = JSON.parse(e.data);
        var { temp, light, lock, noise, cookieJar } = this.state;
        if (serviceNames.tempNoiseLight in data) {
          if (characteristicNames.temperature in data[serviceNames.tempNoiseLight]) {
            temp = data[serviceNames.tempNoiseLight][characteristicNames.temperature];
          }
          if (characteristicNames.noise in data[serviceNames.tempNoiseLight]) {
            noise = data[serviceNames.tempNoiseLight][characteristicNames.noise];
          }
          if (characteristicNames.light in data[serviceNames.tempNoiseLight]) {
            light = data[serviceNames.tempNoiseLight][characteristicNames.light];
          }
        }
        if (serviceNames.lockOpenClose in data) {
          if (characteristicNames.lockOpenClose in data[serviceNames.lockOpenClose]) {
            lock = data[serviceNames.lockOpenClose][serviceNames.lockOpenClose];
          }
        }
        if (serviceNames.cookieJar in data) {
          if (characteristicNames.cookieJar in data[serviceNames.cookieJar]) {
            cookieJar = data[serviceNames.cookieJar][serviceNames.cookieJar];
          }
        }
        this.setState({ temp, light, lock, noise, cookieJar });
      } catch (err) {
        console.log(err);
      }
    });
  }
  render() {
    var { temp, light, lock, noise, cookieJar } = this.state;
    return (<div className='container full-height full-width white big center'>
      <div className='widget half-width half-height bg-purple pad2'>
        temp
        <div>
          {temp}
        </div>
      </div>
      <div className='widget half-width half-height bg-orange pad2'>
        light
        <div>
          {light}
        </div>
      </div>
      <div className='widget third-width half-height bg-gray pad2'>
        lock
        <div>
          {lock ? 'locked' : 'unlocked'}
        </div>
      </div>
      <div className='widget third-width half-height bg-green pad2'>
        noise
        <div>
          {noise}
        </div>
      </div>
      <div className='widget third-width half-height bg-blue pad2'>
        cookie jar
        <div>
          {cookieJar ? 'closed' : 'open'}
        </div>
      </div>
    </div>);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
