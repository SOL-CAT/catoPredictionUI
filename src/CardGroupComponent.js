import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react'
import { Card, Item } from 'semantic-ui-react';
import IndividualCardComponent from './IndividualCardComponent';
import testImage from './testImage.svg';
import useWindowDimensions from './useWindowDimensions';
import * as userWalletUtils from './userWalletUtils';
import { navBarItems, tabItems } from './constantMappings';
const CardGroupComponent = React.memo(props => {
    const wallet = useWallet();
    const { height, width } = useWindowDimensions();
    const verySmallScreen = width < 750 ? true : false;
    const [allBets, setAllBets] = useState([]);
    const [userSolBalance, setUserSolBalance] = useState(0);
    const [userAccountKey, setUserAccountKey] = useState("");
    const [userBetIds, setUserBetIds] = useState([]);
    const [catoStats, setCatoStats] = useState({
        amount: 0,
        catoAddress: null
    });
    useEffect(() => {
        setAllBets(props.allBets);
        setCatoStats(props.catoStats);
        setUserSolBalance(props.solBalance);
        setUserAccountKey(props.userAccountKey);
        setUserBetIds(props.userBetIds);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.allBets, props.solBalance, props.catoStats, props.userAccountKey, props.userBetIds])
    let betType = props.betType,
        tab = props.tab;
    return <Card.Group centered={verySmallScreen}>
        {navBarItems[betType] !== "Portfolio" ? allBets.map((item, index) => {
            return item.type === navBarItems[betType] && (item.category === tabItems[tab] || tab === 0) ? <IndividualCardComponent
                walletConnected={wallet.connected}
                betPlaced={false}
                betId={item.betId}
                betType={item.type}
                image={item.image}
                title={item.title}
                time={item.time}
                odds={item.odds}
                responses={{
                    1: item.responses[1],
                    2: item.responses[2]
                }}
                betData={null}
                volume={item.volume}
                solBalance={userSolBalance}
                hasUserPlacedBet={userBetIds && userBetIds.includes(item.betId)}
                catoStats={catoStats}
                userAccountKey={userAccountKey}
            /> : null
        }) :
            allBets.map((item, index) => {
                return <IndividualCardComponent
                    walletConnected={wallet.connected}
                    betPlaced={true}
                    betId={item.betId}
                    betType={item.type}
                    image={item.image}
                    title={item.title}
                    time={item.time}
                    odds={item.odds}
                    responses={{
                        1: item.responses[1],
                        2: item.responses[2]
                    }}
                    betData={null}
                    volume={item.volume}
                    solBalance={userSolBalance}
                    side={item.side}
                    amount = {item.amount}
                    winning = {item.winning}
                    result = {item.results} />
            })}

    </Card.Group>
});

export default CardGroupComponent;
