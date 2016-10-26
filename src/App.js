import _ from 'lodash';
import React, { Component } from 'react';
import KeyBinding from 'react-keybinding-component';
import './App.css';

const STIM_SIZE = 50 // px
const GRID_SIZE = 64 // scalar
const VISUAL_ANGLE = 11 // px

const NormalColors = {
  Red: '#FF0000',
  Green: '#06cc06'
}

const OddballColors = [
  'blue',
  'yellow',
  'red',
  'purple',
  'orange',
]

const ISIJitter = () => {
  return _.random(950, 1150)
}

const placementJitter = () => {
  return _.random(-VISUAL_ANGLE, VISUAL_ANGLE)
}

const getNumScreens = () => _.random(4, 14)

const getOddballScreenNum = (numScreens) => _.random(4, numScreens)

const getOddballDuration = () => _.sample([750, 900, 1200, 1350])


const stimuliToShow = () => _
  .chain(GRID_SIZE)
  .range()
  .shuffle()
  .take(_.random(6, 12))
  .sortBy()
  .value()

class Circle extends Component {
  render() {
    const { isShown, color } = this.props
    const style = {
      height: STIM_SIZE,
      width: STIM_SIZE,
      marginTop: placementJitter(),
      marginLeft: placementJitter(),
      marginBottom: placementJitter(),
      marginRight: placementJitter(),
      opacity: isShown ? 1 : 0,
      backgroundColor: color,
    }
    return <div className="Circle" style={style}/>
  }
}

class Star extends Component {
  render() {
    const { isShown } = this.props
    const style = {
      marginTop: placementJitter(),
      marginLeft: placementJitter(),
      marginBottom: placementJitter(),
      marginRight: placementJitter(),
      fontSize: STIM_SIZE * 1.5,
      opacity: isShown ? 1 : 0,
      color: _.sample(OddballColors),
    }
    return <div className="Star" style={style}/>
  }
}

class Grid extends Component {
  render() {
    const cols = Math.sqrt(GRID_SIZE)
    const stimuli = this.props.stimuli
    return (
      <div className="Grid">
        {
          _.range(cols).map(i => (
            <div className="Grid-column">
            { _.range(cols).map(j => stimuli[i * cols + j]) }
            </div>
          ))
        }
      </div>
    )
  }
}

class Fixation extends Component {
  render() {
    return (
      <div className="Fixation">
        <div className="Fixation-dot">&times;</div>
      </div>
    )
  }
}

class Instructions extends Component {

  constructor(props) {
    super(props)
    this.state = {
      canContinue: false,
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({canContinue: true}), 5000)
  }

  render() {

    const { title, body, onDone } = this.props
    return (
      <div className="Instructions">
        <div className="Instructions-content">
          <div className="Instructions-title">{title}</div>
          <div className="Instructions-body">{this.props.children}</div>
          <button
            className="Instructions-button"
            disabled={!this.state.canContinue}
            onClick={onDone}>continue
          </button>
        </div>
      </div>
    )
  }
}

class UserInput extends Component {
  render() {
    return (
      <div className="UserInput">
        <div className="UserInput-title">Hi Avi</div>
        <div className="UserInput-number">
          <input type='number' placeholder='How many non-green objects did you see?'/>
        </div>
        <div className="UserInput-duration">
          <button className="UserInput-shorter">Shorter</button>
          <button className="UserInput-longer">Longer</button>
        </div>
      </div>
    )
  }
}

const Mode = {
  Instructions: 0,
  Fixation: 1,
  StandardStimlus: 2,
  OddballStimulus: 3,
  UserInput: 4,
}

const OddballType = {
  Star: 0,
  Circle: 1,
}

const getOddballType = () => _.sample(OddballType)

class App extends KeyBinding {
  constructor(props) {
    super(props)
    const numScreens = getNumScreens()
    this.state = {
      mode: Mode.Instructions,
      trial: 0,
      screenNum: 0,
      numScreens: numScreens,
      standard: stimuliToShow(),
      oddballScreenNum: getOddballScreenNum(numScreens),
      oddballDuration: getOddballDuration(),
      oddballType: getOddballType(),
    }
  }

  advanceMode() {
    const mode = (() => {
      switch (this.state.mode) {
        case Mode.Instructions:
          return Mode.Fixation
        case Mode.StandardStimlus:
        case Mode.OddballStimulus:
          return this.state.screenNum === this.state.numScreens ? Mode.UserInput : Mode.Fixation
        case Mode.Fixation:
          return this.state.screenNum === this.state.oddballScreenNum ? Mode.OddballStimulus : Mode.StandardStimlus
        default:
          throw Error("You shouldn't be here (advanceMode).")
      }
    })()

    const screenNum = mode === Mode.Fixation ? this.state.screenNum + 1 : this.state.screenNum
    if (mode !== Mode.UserInput) {
      setTimeout(() => this.advanceMode(), this.delay(mode))
    }
    this.setState({mode, screenNum})
  }

  delay(mode) {
    switch (mode) {
      case Mode.Fixation:
        return ISIJitter()
      case Mode.StandardStimlus:
        return 1050;
      case Mode.OddballStimulus:
        return this.state.oddballDuration
      default:
        throw Error("You shouldn't be here (delay).")
    }
  }

  render() {

    if (this.state.mode === Mode.Instructions)
      return (
        <div className="App">
          <Instructions
            onDone={() => this.advanceMode()}
            title="Please read these instructions carefully."
          >
            <p>
              In this experiment, you will be shown screens displaying <strong>green objects</strong> and screens displaying various <strong>non-green objects</strong>.
            </p>
            <p>
              After viewing these screens, you will answer two questions:
              <ol>
                <li><strong>How many</strong> non-green objects did you see?</li>
                <li>Were the non-green objects displayed for a <strong>shorter</strong> or <strong>longer</strong> period of time than the green objects?</li>
              </ol>
            </p>
            <p>
              First, you will complete a practice block consisting of 20 trials. Then, you will complete 8 blocks consisting of 20 trials.<p/>
            </p>
            <p>
              If you understand these instructions, please press <strong>continue</strong>.
              Otherwise, please <strong>ask for help</strong>.
            </p>
          </Instructions>
        </div>
      )
    }
    
    if (this.state.mode === Mode.Fixation) {
      return (
        <div className="App">
          <Fixation/>
        </div>
      )
    }

    if (this.state.mode === Mode.UserInput) {
      return (
        <div className="App">
          <UserInput/>
        </div>
      )
    }

    let stimuli = []
    const toShow = this.state.mode === Mode.StandardStimlus ? this.state.standard : stimuliToShow()
    let stimuliPlaced = 0
    stimuli = _.range(GRID_SIZE).map(() => {
      const isShown = toShow.includes(stimuliPlaced++)
      if (this.state.mode === Mode.StandardStimlus) {
        return <Circle color={NormalColors.Green} isShown={isShown} />
      } else if (this.state.mode === Mode.OddballStimulus && this.state.oddballType === OddballType.Star) {
        return <Star isShown={isShown} />
      } else if (this.state.mode === Mode.OddballStimulus && this.state.oddballType === OddballType.Circle) {
        return <Circle color={NormalColors.Red} isShown={isShown} />
      } else {
        throw Error("You shouldn't be here (render)")
      }
    })

    return (
      <div className="App">
        <Grid onKey={this.onKey} stimuli={stimuli}/>
      </div>
    )
  }
}

export default App
