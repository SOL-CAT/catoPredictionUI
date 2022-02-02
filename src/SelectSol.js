import  Slider  from 'rc-slider'
import React, {useState} from 'react'
import { Grid } from 'semantic-ui-react'
import 'rc-slider/assets/index.css';

export default function SelectSol(props) {
    return <Grid.Column width={15}>
        <Slider min={0} max={100} defaultValue={100} value={props.sliderValue} onChange={props.setSliderValue} marks={{0: "", 25: "25%", 50: "50%", 75: "75%", 100: "100%"}} step={1}/>
    </Grid.Column>
}
