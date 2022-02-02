import React, { useState, useEffect } from 'react'
import { Grid, GridColumn, Menu } from 'semantic-ui-react'
import CardGroupComponent from './CardGroupComponent';
import CategoryTabs from './CategoryTabs';
import Paginator from './Paginator'
import useWindowDimensions from './useWindowDimensions';
import * as userWalletUtils from './userWalletUtils';
import { useWallet } from '@solana/wallet-adapter-react';
import ReactGA from 'react-ga';
import { navBarItems, tabItems } from './constantMappings';

export default function MainContent(props) {
    const { height, width } = useWindowDimensions();
    const [currentPage, setPageChange] = useState(1);
    const wallet = useWallet();
    const [currentTab, setTab] = useState(0);
    const [allBets, setAllBets] = useState([]);
    const [userBets, setUserBets] = useState([]);
    const [userBetIds, setUserBetIds] = useState([]);
    const [userSolBalance, setUserSolBalance] = useState(0);
    const [userAccountKey, setUserAccountKey] = useState("");
    const [userCatoStats, setUserCatoStats] = useState({
        amount: 0,
        catoAddress: null
    });
    const smallScreen = width > 1200 ? false : width > 750 ? true : false;
    const verySmallScreen = width < 750 ? true : false;
    useEffect(() => {
        async function callApi() {
            if (navBarItems[props.navBarSelection] !== "Portfolio" && allBets.length === 0) {
                let response = await userWalletUtils.getAllBets();
                setAllBets(response);
            }
            if (wallet.connected && userBets.length === 0) {
                ReactGA.event({
                    category: "CATO Prediction",
                    action: "Wallet Connected",
                    label: wallet.publicKey.toBase58()
                });
                let response2 = await userWalletUtils.getSolBalanceUser(wallet.publicKey);
                setUserSolBalance(response2)
                let catoValue = await userWalletUtils.getCatoBalanceUser(wallet.publicKey);
                setUserCatoStats(catoValue);
                let response3 = await userWalletUtils.getUserAccountKey(wallet.publicKey.toBase58());
                if (response3) {
                    setUserAccountKey(response3);
                    let userBets = await userWalletUtils.getUserBets(wallet.publicKey);
                    setUserBets(userBets);
                    let betIds = [];
                    userBets.map(item => {
                        betIds.push(item.betId);
                    });
                    setUserBetIds(betIds);
                }
            }
            if (!wallet.connected){
                setUserBets([]);
                setUserBetIds([]);
                setUserAccountKey("");
            }
        }
        callApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.connected, props.navBarSelection])
    function onPageChange(event, data) {
        setPageChange(data.activePage)
    }
    function onTabChange(event, data) {
        setTab(data.index)
    }
    return (
        <Grid className="MainContentBox">
            <Grid.Row id="MainContentBoxID" columns={1}>
                <Grid.Column>
                    <Grid.Row columns={2} style={{ height: "100px", paddingTop: "20px", paddingLeft: "20px" }}>
                        {navBarItems[props.navBarSelection] !== "Portfolio" ?
                            <CategoryTabs currentTab={currentTab} onTabChange={onTabChange} />
                            : null}
                    </Grid.Row>
                    <Grid.Row style={{ minHeight: "200px", paddingTop: "20px" }}>
                        {navBarItems[props.navBarSelection] !== "Portfolio" ?
                            <CardGroupComponent
                                page={currentPage}
                                tab={currentTab}
                                betType={props.navBarSelection}
                                wallet={wallet}
                                allBets={allBets}
                                solBalance={userSolBalance}
                                userAccountKey={userAccountKey}
                                userBetIds = {userBetIds}
                                catoStats={userCatoStats} />
                            :
                            <CardGroupComponent
                                page={currentPage}
                                tab={currentTab}
                                betType={props.navBarSelection}
                                wallet={wallet}
                                allBets={userBets}
                                solBalance={userSolBalance}
                                userAccountKey={userAccountKey} />}
                    </Grid.Row>
                    <Grid.Row style={{ height: "100px" }} >
                        <Grid.Column className={verySmallScreen ? "SmallScreenPaginationBar" : "PaginationBar"}>
                            <Paginator activePage={currentPage} onPageChange={onPageChange} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}
