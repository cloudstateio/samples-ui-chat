import * as React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import withRoot from '../withRoot';
import { Button, Grid, TextField } from '@material-ui/core';
import ImagePicker from './ImagePicker';
import { Friend } from '../stores';

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
        minWidth: 400,
        textAlign:"center",
    }
  });


interface Props {
  onClose: () => void;  
  onFriendsAdded: (Friend) => void;
  open: boolean;
  store: any;  
};

type State = {
    name: string;      
}



class FriendDialog extends React.Component<Props & WithStyles<typeof styles>, State> {
  state = {name: "" }
    
  handleClose = () => {
    this.props.onClose();
  };
  onChange = (key) => (event) => {
    let x = {}
    x[key] = event.target.value;
    this.setState(x);
  }   
  handleAddFriend = () => {
      this.props.onFriendsAdded({name: this.state.name, avatar: "imgs/" + Math.round(Math.random()*23) + ".png" } as Friend);
      this.setState({name: ""});      
  }  
 
  render() {  
    const  classes = this.props.classes;  
    return (
      <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={this.props.open} maxWidth="lg">
        <div className={classes.padding}>
        <DialogTitle id="te-dialog-title">Add a Friend</DialogTitle>
        <Grid item xs={12} className={classes.padding}>
          <TextField type="email" onChange={this.onChange("name")} value={this.state.name} required id="name" label="Name of Friend" fullWidth />
        </Grid>                           
        <Grid item xs={12} md={12}>        
          <Button
            variant="contained"
            color="default"
            onClick={this.handleClose}
            className={classes.button}>
            Cancel
          </Button> 
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleAddFriend}
            disabled={
                !(this.state.name != "")
            }
            className={classes.button}>
            Add Friend
          </Button>
        </Grid>
        </div>      
      </Dialog>
    ); 
  }
}

export default withRoot(withStyles(styles)(FriendDialog));