import React, { useState, useEffect } from 'react'
import { Card, Grid, Image, Modal, Popup, Progress, Input, Checkbox } from 'semantic-ui-react';
import moment from 'moment';
import { Button } from '@solana/wallet-adapter-react-ui/lib/Button';
import 'rc-slider/assets/index.css';
import SelectSol from './SelectSol';
import SolInput from './SolInput';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from './idl/mymoneydapp.json';
import { placeBets } from './userWalletUtils';
import * as _ from "lodash";
const programID = new PublicKey(idl.metadata.address);

export default function IndividualCardComponent(props) {
    const { walletConnected, betPlaced, betId, betType, image, title, time, odds, responses, volume, betData, solBalance, side, amount, winning, result, hasUserPlacedBet, catoStats, userAccountKey } = props;
    const wallet = useWallet();
    function simulateMouseClick(e) {
        e.click()
    }
    function changeBetNowStatus() {
        var element = document.querySelector('.wallet-adapter-button.wallet-adapter-button-trigger');
        if (element) simulateMouseClick(element);
    };

    const [sliderValue, setSliderValue] = useState(100);
    const [textBoxValue, setTextBoxValue] = useState(solBalance);
    const [modalBox1Visible, setModalBox1Visible] = useState(false);
    const [modalBox2Visible, setModalBox2Visible] = useState(false);
    const [checkBoxChecked, setCheckBoxChecked] = useState(false);
    const [feesEnoughInCato, setFeesEnoughInCato] = useState(true);
    const [finalBetAmount, setFinalBetAmount] = useState(solBalance);
    const [betPlaceResponse, setBetPlaceResponse] = useState(null);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    function sliderHandle(selectedSliderValue) {
        const valueToSet = Math.floor((selectedSliderValue * solBalance / 100) * 100) / 100;
        if (userAccountKey){
        if ( valueToSet >= 0.04) {
            setTextBoxValue(valueToSet);
            setSliderValue(selectedSliderValue);
        }
    }
        else{
            if (solBalance - valueToSet > 0.005 && valueToSet >= 0.04){
                setTextBoxValue(valueToSet);
                setSliderValue(selectedSliderValue);
            }
        }
    
    }

    function setAmountFromFees(source) {
        let fee = getFeesFromAmount(textBoxValue);
        if (source === "from_toggle") {
            if (!checkBoxChecked) {
                setFinalBetAmount(textBoxValue);

            }
            else {
                let tt = Math.floor((textBoxValue - fee.solFees) * 100) / 100;
                setFinalBetAmount(tt);
            }
        }
        else {
            if (checkBoxChecked) {
                setFinalBetAmount(textBoxValue);
            }
            else {
                let tt = Math.floor((textBoxValue - fee.solFees) * 100) / 100;
                if (tt >= 0.02)
                    setFinalBetAmount(tt);
            }
        }
    }
    function getEstimatedWinningAmount(amount2, odds2, side2){
        return (_.isNaN(amount2 * odds2[side2 === 1 ? 2 : 1] / odds2[side2] + amount2)) ?
                amount2 : (amount2 * odds2[side2 === 1 ? 2 : 1] / odds2[side2] + amount2).toFixed(2) 
    }
    async function placeBet(side) {
        let response = await placeBets(wallet, programID, {
            side: side,
            id: betId,
            time: +new Date(),
            amount: textBoxValue,
            feeInCato: checkBoxChecked,
            account: userAccountKey,
            catoAddress:  catoStats.catoAddress,
            amountCatoFees: !checkBoxChecked ? 0 : getFeesFromAmount(textBoxValue)
        });
        if (response.length < 2)
            setButtonDisabled(true);
        setBetPlaceResponse(response);
    }
    function getFeesFromAmount(betAmount) {
        let catoFees = 0,
            solFees = 0;
        if (betAmount < 0.5) {
            catoFees = 167;
            solFees = 0.02;
        }
        else if (betAmount > 0.5 && betAmount < 1) {
            catoFees = 333;
            solFees = 0.03;
        }
        else if (betAmount > 1 && betAmount < 5) {
            catoFees = 833;
            solFees = 0.09;
        }
        else {
            catoFees = 3000;
            solFees = (betAmount / 20).toFixed(2);
        }
        return {
            catoFees: catoFees,
            solFees: solFees
        };
    }
    function handleFees() {
        if (checkBoxChecked) {
            setCheckBoxChecked(false);
            setAmountFromFees("from_toggle")
        }
        else {
            let fees = getFeesFromAmount(textBoxValue);
            if (catoStats.amount > fees.catoFees || catoStats.amount === fees.catoFees) {
                setCheckBoxChecked(true);
                setAmountFromFees("from_toggle");
                setFeesEnoughInCato(true);
            }
            else {
                setFeesEnoughInCato(false);
            }
        }

    }
    function getModelContent(side) {
        return <Modal.Content>
            <div>
                <span className="infoMetric"> Do you want to pay fee in CATO? </span>
            </div>
            <div style={{ paddingTop: "10px" }}>
                <Checkbox onClick={handleFees} toggle checked={checkBoxChecked} />
                {!feesEnoughInCato ? <span style={{ position: "relative", bottom: "5px", left: "10px", color: "red", fontSize: "12px" }}>{"You do not have " + getFeesFromAmount(textBoxValue).catoFees + "CATO for fees!"}</span> : null}
            </div>
            <div style={{ paddingTop: "10px" }}>
                <span className="infoMetric">Prediction Amount: </span>
                <span className="infoValue" style={{ paddingRight: "5px" }}>{finalBetAmount}</span><span className="infoValue">SOL</span>
            </div>
            <div style={{ paddingTop: "10px" }}>
                <span className="infoMetric">Estimated Winning: </span>
                <span className="infoValue" style={{ paddingRight: "5px" }}>{getEstimatedWinningAmount(finalBetAmount, odds, side)}</span><span className="infoValue">SOL</span>
            </div>
            <div style={{ paddingTop: "10px", fontSize: "12px" }}>Click the button below to confirm</div>
            <Button disabled={isButtonDisabled} className={side === 1 ? "greenButton" : "redButton"} style={{ height: "45px", width: "250px" }} onClick={() => { placeBet(side) }}>{"Your choice: " + responses[side]} </Button>
            {betPlaceResponse ? <div style={{ paddingTop: "30px" }}>
                {betPlaceResponse.map(item => {
                    let key = Object.keys(item)[0];
                    return <div>
                    <span className='infoMetric'>{key + ": "}</span>
                    <span className='infoValue'>{item[key]}</span>
                    </div>
                })}
            </div> : null}
        </Modal.Content>
    }
    useEffect(() => {
        if (userAccountKey){
        setTextBoxValue(solBalance);
        setSliderValue(100);
        }
        else if (solBalance > 0.005){
            let ta = Math.floor((solBalance - 0.005)*100)/100;
            setTextBoxValue(ta)
            setSliderValue(100);
        }
        else{
            setTextBoxValue(0);
            setSliderValue(0);
        }
    }, [solBalance, hasUserPlacedBet])
    function getWinning() {
        let estimatedWinning = getEstimatedWinningAmount(amount, odds, side);
        return estimatedWinning;
    }
    let currentUnixTime = + new Date();
    return <Card
        className="betCard"
    >
        <Image src={image}></Image>
        <Card.Content>
            <Card.Header>
                <div style={{ fontWeight: 400, color: "white", height: "80px" }}>{title}</div>
            </Card.Header>
            <Card.Meta>
                {moment.unix(time).format(' MMMM Do, YYYY h:mm:ss A')}
            </Card.Meta>
            <Card.Description>
                <Grid>
                    <Grid.Row>
                        <Popup trigger={
                            <Progress value={odds["1"] + odds["2"] === 0 ? 1 : odds["1"]} total={odds["1"] + odds["2"] === 0 ? 2 : odds["1"] + odds["2"]} size="tiny" />}>
                            <Popup.Header>Odds</Popup.Header>
                            <Popup.Content>
                                <div>{responses[1] + " : " + odds[1]}</div>
                                <div>{responses[2] + " : " + odds[2]}</div>
                            </Popup.Content>
                        </Popup>
                    </Grid.Row>
                    {!betPlaced ?
                        <Grid.Row columns={2} centered className="answersButtons">
                            <Grid.Column>
                                <Modal open={modalBox1Visible}
                                    className="placeBetModal"
                                    closeIcon
                                    trigger={<Button className="greenButton" disabled={time < currentUnixTime/1000 || solBalance < 0.02 || !walletConnected || textBoxValue <= 0.02 || betType !== "Live" || hasUserPlacedBet || isButtonDisabled}>{responses[1]}</Button>}
                                    onOpen={() => {
                                        setModalBox1Visible(true);
                                        setAmountFromFees();
                                    }
                                    }
                                    onClose={() => {
                                        setModalBox1Visible(false);
                                    }}>
                                    <Modal.Header>Welcome to the Beta Launch!</Modal.Header>
                                    {getModelContent(1)}
                                </Modal>
                            </Grid.Column>
                            <Grid.Column>
                                <Modal open={modalBox2Visible}
                                    className="placeBetModal"
                                    closeIcon
                                    trigger={<Button className="redButton" disabled={time < currentUnixTime/1000 || !walletConnected || textBoxValue <= 0.02 || betType !== "Live" || hasUserPlacedBet || isButtonDisabled}>{responses[2]}</Button>}
                                    onOpen={() => {
                                        setModalBox2Visible(true);
                                        setAmountFromFees();
                                    }}
                                    onClose={() => {
                                        setModalBox2Visible(false)
                                    }}>
                                    <Modal.Header>Welcome to the Beta Launch!</Modal.Header>
                                    {getModelContent(2)}
                                </Modal>
                            </Grid.Column>
                        </Grid.Row>
                        :
                        <Grid.Row columns={2} className='answersButtons'>
                            <Grid.Column width={6}>
                                <Button className={side === 1 ? "greenButton" : "redButton"}>{responses[side]}</Button>
                            </Grid.Column>
                            <Grid.Column width={10}>
                                <div className="solBalanceStat" style={{ position: "relative", bottom: "10px" }}>
                                    <Input type="number" step={0} min={amount} max={amount} value={amount} disabled />
                                    <span className="solLabel">SOL</span>
                                </div>
                            </Grid.Column>
                        </Grid.Row>}
                    {!walletConnected ?
                        <Grid.Row columns={1} centered className="betNowButtons" verticalAlign="middle">
                            <Grid.Column>
                                <Button onClick={changeBetNowStatus} className="greenButton">Predict Now</Button>
                            </Grid.Column>
                        </Grid.Row>
                        : null
                    }
                    {walletConnected && !betPlaced && betType !== "Closed" ?
                        <>
                            <Grid.Row columns={1} centered className="solSelectBar">
                                <SelectSol sliderValue={sliderValue} setSliderValue={sliderHandle} />
                            </Grid.Row>
                            <Grid.Row columns={2} centered className="solSelectBar">
                                <SolInput sliderValue={sliderValue} solBalance={solBalance} textBoxValue={textBoxValue} />
                            </Grid.Row>
                        </>
                        : null}
                </Grid>
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
            {<span >
                <div>
                    <span style={{ fontWeight: 400 }}>{"Volume: "}</span><span style={{ fontWeight: 700 }}>{volume + " SOL"}</span>
                </div>
                {result && betPlaced ? <div>
                    <span style={{ fontWeight: 400 }}>{"Winning: "}</span><span style={{ fontWeight: 700 }}>{winning + " SOL"}</span>
                </div> : betPlaced ?
                    <div>
                        <span style={{ fontWeight: 400 }}>{"Estimated Winning: "}</span><span style={{ fontWeight: 700 }}>{getWinning() + " SOL"}</span>
                    </div>
                    : null
                }

            </span>}
        </Card.Content>
    </Card>
}
