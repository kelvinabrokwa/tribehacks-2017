/**
 * Frontend
 */

import ReactDOM from 'react-dom';
import React from 'react';

class App extends React.Component {
  componentDidMount() {
    var socket = new WebSocket('ws://localhost:8081');
    socket.addEventListener('message', e => {
      try {
        console.log(JSON.parse(e.data));
      } catch (err) {
        console.log(err);
      }
    });
  }
  render() {
    return (<div className='container full-height full-width white big center'>
      <div className='widget half-width half-height bg-purple pad2'>temp</div>
      <div className='widget half-width half-height bg-orange pad2'>light</div>
      <div className='widget third-width half-height bg-gray pad2'>lock</div>
      <div className='widget third-width half-height bg-green pad2'>noise</div>
      <div className='widget third-width half-height bg-blue pad2'>lock</div>
    </div>);
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
