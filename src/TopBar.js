import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { Grid } from 'semantic-ui-react';
import useWindowDimensions from './useWindowDimensions';
export default function TopBar(props) {
    const { themeColor } = props;
    const wallet = useWallet();
    const { height, width } = useWindowDimensions();
    const smallScreen = width > 1200 ? false : width > 750 ? true : false;
    const verySmallScreen = width < 750 ? true : false;
    let cssProperty = {
        backgroundColor: themeColor,
    };
    return (
        <Grid>
            <Grid.Row style={{ paddingTop: "30px" }} columns={wallet.wallet ? 3 : 2} className={smallScreen || verySmallScreen ? "paddingLeft3 height100px paddingRight6" : "paddingLeft3 height100px paddingRight3"}>
                <Grid.Column width={verySmallScreen ? 8 : 11    }>
                    {getLogo()}
                </Grid.Column>
                {!wallet.wallet ?
                    <>
                        <Grid.Column width={2}>
                            <WalletMultiButton style={cssProperty} id="connectWalletButtonId" />
                        </Grid.Column></>
                    : !smallScreen && !verySmallScreen ?
                        <>
                            <Grid.Column width={2}>
                                <WalletMultiButton style={cssProperty} />
                            </Grid.Column>
                            <Grid.Column width={2}>
                                {wallet.wallet ? <WalletDisconnectButton style={cssProperty} /> : null}
                            </Grid.Column>
                        </>
                        : smallScreen ?
                            <>
                                <Grid.Column width={2}>
                                    <WalletMultiButton style={cssProperty} className={smallScreen ? "height50percent" : ""} />
                                    <WalletDisconnectButton style={cssProperty} className={smallScreen ? "height50percent" : ""} />
                                </Grid.Column>
                            </>
                            : <>
                                <Grid.Column width={8}>
                                    <WalletMultiButton style={cssProperty} className={verySmallScreen ? "height50percent" : ""} />
                                    <WalletDisconnectButton style={cssProperty} className={verySmallScreen ? "height50percent" : ""} />
                                </Grid.Column>
                            </>
                }
            </Grid.Row>
        </Grid>
    )
    function getLogo() {
        return <>
            <div style={{ fontSize: "32px", color: themeColor, fontWeight: 700  }}>
                CATO
            </div>
            <div style={{ fontSize: "28px", paddingTop: "15px", color: "white" }}>
                Prediction Market
            </div>
        </>
    }
}

