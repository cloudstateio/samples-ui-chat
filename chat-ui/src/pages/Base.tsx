import * as React from 'react';
import clsx from 'clsx';
import { Route } from 'react-router';
import classNames from 'classnames';
import {observer, inject} from 'mobx-react';
import { MuiThemeProvider, createMuiTheme, withStyles, WithStyles, Theme } from '@material-ui/core/styles';
import createStyles from '@material-ui/core/styles/createStyles';
import withRoot from '../withRoot';
import { IconButton, Typography, CssBaseline, AppBar, Drawer, Toolbar, Divider, List, ListItem, ListItemIcon, ListItemText, GridList, GridListTile, Paper, Avatar } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChatIcon from '@material-ui/icons/Chat';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AddIcon from '@material-ui/icons/Add';
import Chat from '../controls/Chat';
import UserDialog from '../controls/UserDialog';
import { User } from '../stores';
import UserAvatar from '../controls/UserAvatar';

const drawerWidth = 256;

const styles = (theme: Theme) =>
createStyles({
    root: {
        display: 'flex',
      },
      appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      },
      appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
      menuButton: {
        marginRight: 36,
      },
      hide: {
        display: 'none',
      },
      drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',        
      },
      listPadding:{
        paddingLeft: 5,
      },
      drawerOpen: {
        width: drawerWidth,
        color: "white",
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },   
      drawerClose: {
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        color: "white",
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9) + 1,
        },
      },
      toolbar: {          
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
      },
      gridList: {
        height: "450px",
      },
});

type State = {
  open: boolean;
  userDialogOpen: boolean;
};

type Props = {
  store: any
}

@inject('routing')
@observer
class Base extends React.Component<Props & WithStyles<typeof styles>, State> {
  state = {
    open: true,
    userDialogOpen: false,
  };
  
  constructor(props){
    super(props);
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };
  handleDrawerToggle = () =>{
    this.setState({ open: !this.state.open });
  }
  handelOnUserAddOpen = () =>{    
    this.setState({ userDialogOpen: true });
  }
  handelAddUserClose = () =>{
    this.setState({ userDialogOpen: false });
  }
  handelOnUserAdd = (user: User) => {   
    this.props.store.api.addUser(user);    
    this.handelAddUserClose();
  }

  handelOnUserOnline = (user: User) => () =>{
    this.handelOnUserAdd({...user, online: true});
  }

  render() {
    console.log("APP RENDER!!", this.props);
    const tileData = [
        {"name": "corey"},
        {"name": "tom"},
        {"name": "john"}
    ]
    const classes = this.props.classes;    
    return (    
        <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: this.state.open,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              edge="start"
              className={clsx(classes.menuButton, {
                [classes.hide]: this.state.open,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Cloudstate Chat Sample
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: this.state.open,
            [classes.drawerClose]: !this.state.open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: this.state.open,
              [classes.drawerClose]: !this.state.open,
            }),
          }}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon style={ {color: "white"} } />
            </IconButton>
          </div>
          <Divider />
          {/*
          <List className={classes.listPadding}>
              <ListItem button key={"chat"}>
                <ListItemIcon><ChatIcon /></ListItemIcon>
                <ListItemText primary={"Chat"} />
              </ListItem>
          </List>
          */}
          <List className={classes.listPadding}>
              <ListItem button onClick={this.handelOnUserAddOpen} key={"add_user"}>
                <ListItemIcon><PersonAddIcon /></ListItemIcon>
                <ListItemText primary={"Add User"} />
              </ListItem>
          </List>     
          <Divider />
          <List className={classes.listPadding}>
            {this.props.store.userStore.stream.filter(x => !x.online).map(user => (
              <ListItem button onClick={this.handelOnUserOnline(user)} key={user.name}>
                <ListItemIcon><UserAvatar user={user} store={this.props.store} /></ListItemIcon>
                <ListItemText primary={user.name} />
              </ListItem>
               ))} 
          </List>            
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
        
          <GridList spacing={1} style={ {height: "100%"} } className={classes.gridList} cols={2}>
            {this.props.store.userStore.stream.filter(x => x.online).map(user => (
            <GridListTile style={ {height: 410} } key={user.name} cols={1}>
                <Chat store={this.props.store} user={user as User} />
            </GridListTile>
            ))}           
        </GridList>
        </main>
        <UserDialog store={this.props.store} onClose={this.handelAddUserClose} onUserAdded={this.handelOnUserAdd} open={this.state.userDialogOpen} />
      </div>      
    );
  }
}


export default withRoot((withStyles(styles)(Base) ));
