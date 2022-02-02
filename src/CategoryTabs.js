import React, { useState } from 'react'
import { Menu, Image, Grid } from 'semantic-ui-react';
import useWindowDimensions from './useWindowDimensions';
import cryptoIcon from './cryptoIcon.svg';
import { tabItems } from './constantMappings';
export default function CategoryTabs(props) {
    const categories = tabItems;
    const { width } = useWindowDimensions();
    const verySmallScreen = width < 750 ? true : false;
    return <Menu secondary inverted className="tabClass">
        <Grid centered>
        {categories.map((item, index) => {
            return <Menu.Item
            className={verySmallScreen ? "smallerFont" : ""}
            name={categories[props.currentTab]}
            active={props.currentTab === index}
            index={index}
            onClick={props.onTabChange}
        ><Image src={cryptoIcon} className="tabIcons" size="mini"/>{item}</Menu.Item>
        })}
        </Grid>
    </Menu>
}
