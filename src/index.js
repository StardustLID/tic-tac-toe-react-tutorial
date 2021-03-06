import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style = {{'background': props.isWinningLine ? '#0f0' : '#fff'}}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        // highlight the three squares that caused the win
        isWinningLine={this.props.winningLine && this.props.winningLine.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const idx = [...Array(3).keys()];
    return (
      <div>
        {idx.map(i => (
          <div className="board-row">
            {idx.map(j => this.renderSquare(i*3 + j))}
          </div>)
        )}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      jumping: null,
      ascendingMoves: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    const col = i % 3;
    const row = (i - col) / 3;
    this.setState({
      history: history.concat([{
        squares: squares,
        col: col,
        row: row,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      jumping: null,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      jumping: step,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner, winningLine] = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move} style={{fontWeight: move === this.state.jumping ? 'bold' : 'normal'}}>
          ({step.col}, {step.row})
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      // draw if (1) all squares are filled; AND (2) there is no winner
      if (current.squares.every(x => x) && !winner) status = 'Draw';
      else status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningLine={winningLine}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.setState({ascendingMoves: !this.state.ascendingMoves})}>
            ascending/descending
          </button>
          <ol>{this.state.ascendingMoves ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return [null, null];
}
