import { useWallet } from '@solana/wallet-adapter-react';
import React, { useState } from 'react'
import {  Menu, Sidebar, Image } from 'semantic-ui-react';
import catoLogo from './catoLogo.png';
import { navBarItems } from './constantMappings';
export default function SideBarNavigator(props) {

    const menuItemList = navBarItems;
    const wallet = useWallet();
    return <Sidebar as={Menu}
        animation="push"
        icon='labeled'
        inverted
        vertical
        visible
        secondary
        width='thin'
        activeIndex={props.menuItemSelected}>
        <Menu.Item as='a'>
            <Image src={catoLogo}></Image>
        </Menu.Item>
        {menuItemList.map((item, index) => {
            return <Menu.Item as='a'
                active={props.menuItemSelected === index}
                onClick={props.onNavBarSelectionChange}
                name={menuItemList[props.menuItemSelected]}
                className={props.menuItemSelected === index ? "selectedMenuItem" : "unSelectedMenuItem"}
                index={index}
                disabled = {index === 3 && !wallet.connected}>
                    
                {<><span className={props.menuItemSelected === index ? "selectedMenuRedDot" : ""}></span>{item}</>}
            </Menu.Item>
        })}
    </Sidebar>
}
