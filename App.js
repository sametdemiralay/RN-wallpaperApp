import React, {Component} from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFetchBlob from 'rn-fetch-blob';
import {globalStyle} from './GlobalStyles';

const {height, width} = Dimensions.get('window');

export async function request_storage_runtime_permission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'ReactNativeCode Storage Permission',
        message:
          'ReactNativeCode App needs access to your storage to download Photos.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Storage Permission Granted.');
    } else {
      Alert.alert('Storage Permission Not Granted');
    }
  } catch (err) {
    console.warn(err);
  }
}

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      images: [],
      scale: new Animated.Value(1),
      isImageFocused: false,
    };

    this.scale = {
      transform: [{scale: this.state.scale}],
    };

    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -80],
    });
  }

  loadWallpapers = () => {
    axios
      .get(
        'https://api.unsplash.com/photos/random?count=5&client_id=b0095559ed608c000b6fab7edeb89733529b26cb517c1dba7345a0f76527b505',
      )
      .then(
        function(response) {
          //console.log(response.data);
          this.setState({images: response.data, isLoading: false});
        }.bind(this),
      )
      .catch(function(error) {
        console.log(error);
      })
      .finally(function() {
        console.log('request completed');
      });
  };

  async componentDidMount() {
    this.loadWallpapers();
    await request_storage_runtime_permission();
  }

  //
  saveToCameraRoll = resim => {
    var date = new Date();
    var image_URL = resim.urls.regular;
    var ext = this.getExtention(image_URL);
    ext = '.' + ext[0];
    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/image_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        description: 'Image',
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        Alert.alert('Image Downloaded Successfully.');
      });
  };

  getExtention = filename => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  };
  //

  showControls = item => {
    this.setState(
      state => ({
        isImageFocused: !state.isImageFocused,
      }),
      () => {
        if (this.state.isImageFocused) {
          Animated.spring(this.state.scale, {
            toValue: 0.9,
          }).start();
        } else {
          Animated.spring(this.state.scale, {
            toValue: 1,
          }).start();
        }
      },
    );
  };

  renderItem = ({item}) => {
    return (
      <View style={{flex: 1}}>
        <View style={globalStyle.style1}>
          <ActivityIndicator size="large" color="#B1B1B1" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{height, width}, this.scale]}>
            <Image
              style={globalStyle.style2}
              source={{uri: item.urls.regular}}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View style={[globalStyle.style3, {bottom: this.actionBarY}]}>
          <View style={globalStyle.style4}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.loadWallpapers()}>
              <Icon name="md-refresh" color="#FFF" size={40} />
            </TouchableOpacity>
          </View>

          <View style={globalStyle.style5}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.saveToCameraRoll(item)}>
              <Icon name="md-save" color="#FFF" size={40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  render() {
    return this.state.isLoading ? (
      <View style={globalStyle.style6}>
        <ActivityIndicator size="large" color="#B1B1B1" />
      </View>
    ) : (
      <View style={globalStyle.style7}>
        <FlatList
          horizontal
          scrollEnabled={!this.state.isImageFocused}
          pagingEnabled
          data={this.state.images}
          keyExtractor={item => item.id}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
