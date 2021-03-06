import React from 'react';
import _ from 'lodash';

import RaisedButton from 'material-ui/lib/raised-button';
import Paper from 'material-ui/lib/paper';
import TextField from 'material-ui/lib/text-field';
import Colors from 'material-ui/lib/styles/colors';
import Snackbar from 'material-ui/lib/snackbar';

import Posts from './posts.json';
import Pagination from '../../partial/pagination';
import Loading from '../../partial/loading'
import PostExcerpt from './postexcerpt';

const PostList = React.createClass({
    PropTypes: {
        range: React.PropTypes.string,
        length: React.PropTypes.number,
        page: React.PropTypes.number,
        total_page: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            range: "all",
            length: 10,
            page: 1
        }
    },
    getCurrentURL() {
        if (this.props.range === 'all')
            return "posts/recent/";
        else return "posts/" + this.props.range + "/recent/";
    },
    style: {
        pagination: {
            position: "fixed",
            left: "0px",
            bottom: "0px"
        }, card: {
            float: "right"
        }, errorStyle: {
            color: Colors.orange500,
          },
          button: {
              marginLeft: "13%",
              marginBottom: "17%",
          },
          textfield: {
              fontSize: 18,
              marginLeft: "13%",
              marginTop: "22%",
              marginBottom: "2%"
          },
          underlineStyle: {
            borderColor: Colors.orange500,
          },
    },
    getInitialState(){
        return {
            allow: false,
            loaded: false
        };
    },
    componentDidMount() {
        let ctx = this;
        $.ajax({
            type: "GET",
            url: `https://raw.githubusercontent.com/RoyTimes/markdown/master/verify.json`,
            success: function(data) {
                let Passwd = JSON.parse(data).passwd;
                if(ctx.isMounted())
                    ctx.setState({
                        Passwd:Passwd,allow: false,
                        open:false,loaded: true
                    })
            }
        });
    },
    PostsSortMethod(x, y) {
        if (x.top !== undefined) return 1;
        else if (y.top !== undefined) return -1;
        let XDate = x.time, YDate = y.time;
        let X = x.time.split('-'),
            Y = y.time.split('-');
        return (new Date(X[0], X[1], X[2]) -
            new Date(Y[0], Y[1], Y[2]));
    },
    render() {
        if (this.props.range === "passwd"){
            if (this.state.loaded === false)
                return (<Loading title="Wait a second. Preparing Password Verification!" />);

            else if (this.state.allow === false) {
                let that = this;
                return (
                    <Paper>
                        <TextField
                        style={this.style.textfield}
                        type="password"
                         ref="getPassword"
                         clssName="textfield"
                         hintText="Enter Password to Access"
                         underlineStyle={this.style.underlineStyle} />

                         <br/><br/>
                         <RaisedButton
                            style={this.style.button}
                            label="submit" primary={true}
                            onClick={function(e) {
                             if (that.state.loaded) {
                                let getPassword = that.refs.getPassword.getValue();
                                let AccessConfirmed = false;
                                that.state.Passwd.map(function(item){
                                    if(item === hex_md5(getPassword)){
                                        AccessConfirmed = true;
                                        return;
                                    }
                                });
                                if(AccessConfirmed === true){
                                    that.setState({allow:true});
                                    console.log("Loggin ");
                                }
                                else {
                                    that.setState({open:true});
                                    console.log("Denied");
                                }
                             }
                         }}/>
                         <Snackbar
                             open={this.state.open}
                             message="Password Wrong"
                             action="Deny"
                             autoHideDuration={5000}
                           />
                    </Paper>
                );

            } else if (this.state.allow) {
                let PostsArray = [];
                Posts.content.map (function (cate) {
                    Posts.content[cate.index].posts.map(function (post){
                        if (post.category === "passwd")
                            PostsArray.push(post);
                    });
                });

                _(PostsArray).sortBy("time");
                PostsArray = _(PostsArray).reverse().value()

                if (this.props.total_page != 1) {
                    PostsArray = _.slice(PostsArray, 5 *
                        (this.props.page - 1), 5 * (this.props.page - 1) + 4);
                }

                let that = this;
                return (
                    <div>
                        {PostsArray.map(function (post) {
                            return (
                                <div>
                                    <PostExcerpt
                                        title={post.name}
                                        excerpt={post.excerpt}
                                        redir_url={post.url}
                                    />
                                    <br/><br/>
                                </div>
                            )
                        })}
                        <br/><br/><br/><br/><br/>
                        <Pagination
                            style={this.style.pagination}
                            range={this.props.total_page}
                            current_active={this.props.page}
                            request_raw_url={this.getCurrentURL()} />
                    </div>
                );
            }
        }
        let PostsArray = [];
        Posts.content.map (function (cate) {
            Posts.content[cate.index].posts.map(function (post){
                if (post.category !== "passwd")
                    PostsArray.push(post);
            });
        });

        PostsArray.sort(this.PostsSortMethod);
        PostsArray = _(PostsArray).reverse().value()

        if (this.props.total_page != 1) {
            PostsArray = _.slice(PostsArray, 5 * (this.props.page - 1),
                5 * (this.props.page - 1) + 5);
        }
        let that = this;
        return (
            <div>
                {PostsArray.map(function (post) {
                    if (that.props.range === "all" ||
                        that.props.range === post.category)
                    return (
                        <div>
                            <PostExcerpt
                                title={post.name}
                                excerpt={post.excerpt}
                                redir_url={post.url}
                            />
                            <br/><br/>
                        </div>
                    )
                })}
                <br/><br/><br/><br/><br/>
                <Pagination
                    style={this.style.pagination}
                    range={this.props.total_page}
                    current_active={this.props.page}
                    request_raw_url={this.getCurrentURL()} />
            </div>
        );
    }
});


export default PostList;
