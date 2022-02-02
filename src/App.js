import './App.css';
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {  Segment, Sidebar} from 'semantic-ui-react';
import TopBar from './TopBar';
import MainContent from './MainContent';
import SideBarNavigator from './SideBarNavigator';
require('@solana/wallet-adapter-react-ui/styles.css');
const themeColor = "#FEA910";

export const App = () => {

  const [visible, setVisible] = useState(false);
  const [navBarSelection, setNavBarSelection] = useState(0);
  function onNavBarSelectionChange(event, data) {
    setNavBarSelection(data.index);
}
  return <Sidebar.Pushable as={Segment}>
    <SideBarNavigator onNavBarSelectionChange={onNavBarSelectionChange} menuItemSelected={navBarSelection}/>
    <Sidebar.Pusher>
      <TopBar themeColor={themeColor} />
      <MainContent navBarSelection={navBarSelection} />
    </Sidebar.Pusher>
  </Sidebar.Pushable>


}



