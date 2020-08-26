import * as React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import withRoot from '../withRoot';
import { Button, Grid, TextField } from '@material-ui/core';
import ImagePicker from './ImagePicker';
import {Friend, User} from '../stores/index'
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      
    },   
    button: {
      margin: theme.spacing(1),
    },
    buttonBar: {
      textAlign: "right"
    },
    editorContainer:{
      paddingTop: "20px"
    },
    padding: {
        padding: theme.spacing(2),
        minWidth: 750,
        textAlign:"center",
    },
      connected: {
          color: "green"
      },
      failed: {
          color: "red"
      }
  });


interface Props {
  onClose: () => void;  
  open: boolean;
  store: any;  
};

type State = {
    hostnameFriends: string;
    connectedFriends: boolean;
    connectError: string;
    hostnamePresence: string;
    connectedPresence: boolean;
}



class ConfigureDialog extends React.Component<Props & WithStyles<typeof styles>, State> {
  state = {
      hostnameFriends: window.localStorage.getItem("hostnameFriends") || "",
      connectedFriends: false,
      hostnamePresence: window.localStorage.getItem("hostnamePresence") || "",
      connectedPresence: false,
      connectError: undefined,
  }
    
  handleClose = () => {
    this.props.onClose();
  };
  onChange = (key) => (event) => {
    let x = {}
    x[key] = event.target.value;
    this.setState(x);
  }   

    handleConnectFriends = () => {
        this.props.store.api.setFriendsHostname("https://"+this.state.hostnameFriends);
        window.localStorage.setItem("hostnameFriends", this.state.hostnameFriends);
        // Just test a call to see if we have the right hostname.
        this.props.store.api.getFriends({name:"connection-test", avatar:"", online: false} as User).then( (x) =>{
            this.setState({connectedFriends:true, connectError: undefined});
        }).catch( (err) => {
            console.error("error", err);
            this.setState({connectError:err.toString()});
        });
    }
    handleConnectPresence = () => {
        this.props.store.api.setPresenceHostname("https://"+this.state.hostnamePresence);
        window.localStorage.setItem("hostnamePresence", this.state.hostnamePresence);
        this.props.store.api.testPresenceConnection().then( (x) =>{
            console.log("CONNECTED");
            this.setState({connectedPresence:true, connectError: undefined});
            this.handleClose();
        }).catch( (err) => {
            console.error("error", err);
            this.setState({connectError:err.toString()});
        });
    }

  render() {  
    const  classes = this.props.classes;  
    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={this.props.open} maxWidth="lg">
          {this.state.connectedFriends ?
              <div className={classes.padding}>
                  <DialogTitle id="te-dialog-title">Configure your &quot;Presence&quot; Backend</DialogTitle>
                  {this.state.connectError ?
                      <Grid item xs={12} className={classes.padding}>
                          <Typography variant="h6" className={classes.failed}
                                      gutterBottom><CloseIcon/> {this.state.connectError}</Typography>
                      </Grid> : null}
                  <Grid item xs={8} className={classes.padding}>
                      <TextField label={"Enter the hostname of your exposed PRESENCE service."} type="text"
                                 onChange={this.onChange("hostnamePresence")} value={this.state.hostnamePresence} required
                                 id="hostname" fullWidth/>
                  </Grid>
                  <Grid item xs={4} className={classes.padding}>
                      <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleConnectPresence}
                          disabled={
                              !(this.state.hostnamePresence != "")
                          }
                          className={classes.button}>
                          Connect
                      </Button>
                  </Grid>
              </div>
              :
              <div className={classes.padding}>
                  <DialogTitle id="te-dialog-title">Configure your &quot;Friends&quot; Backend</DialogTitle>
                  {this.state.connectError ?
                      <Grid item xs={12} className={classes.padding}>
                          <Typography variant="h6" className={classes.failed}
                                      gutterBottom><CloseIcon/> {this.state.connectError}</Typography>
                      </Grid> : null}
                  <Grid item xs={8} className={classes.padding}>
                      <TextField label={"Enter the hostname of your exposed FRIENDS service."} type="text"
                                 onChange={this.onChange("hostnameFriends")} value={this.state.hostnameFriends} required
                                 id="hostname" fullWidth/>
                  </Grid>
                  <Grid item xs={4} className={classes.padding}>
                      <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleConnectFriends}
                          disabled={
                              !(this.state.hostnameFriends != "")
                          }
                          className={classes.button}>
                          Connect
                      </Button>
                  </Grid>
              </div>
          }

      </Dialog>
    ); 
  }
}

export default withRoot(withStyles(styles)(ConfigureDialog));