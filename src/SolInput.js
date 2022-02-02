import React from 'react'
import { Grid, Input } from 'semantic-ui-react'

export default function SolInput(props) {
    const totalSol = props.solBalance;
    const textBoxValue = props.textBoxValue;
    return <Grid.Column width={16}>
    <div className="solBalanceStat">
        <Input type="number" step={0.1} min={0} max={totalSol} value = {textBoxValue} disabled/>
        <span className="solLabel">SOL</span>
    </div>
</Grid.Column>
}
