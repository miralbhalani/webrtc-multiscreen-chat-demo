
requirejs.config({
  baseUrl: 'browser'
});

require(['Chat', 'PeerConection'], function (_module) {
  // var g = new module.Chat()

  Main(_module);
});

function Main(_dependancies) {

  const { Chat, PeerConnection } = _dependancies;

  // chatInstance is instance where you will interact with all it's methods
  const chatInstance = new Chat();

  // Connect chat insatance to your server port or domain
  chatInstance.connect("localhost:5000");

  // Tell chatInstance to use your camera to show your video stream
  // in your local video element.
  // This same stream will be used when you call to some socket/user 
  // as input call stream
  chatInstance.usMyCameraStream((stream) => {
    const localVideo = document.getElementById('local-video');
    if (localVideo) {
      localVideo.srcObject = stream;
    }
  });

  // this is a listner which will ask you to update your user list
  // that you are showing in your html
  // users is a list of array of online sockets
  chatInstance.watchOnSocketIds((users) => {
    updateUserList(users);
  });

  // when you get incomming call from someone 
  // it automatically will start giving you the incoming strem in 
  // below listener. And you can set that stream to your remote video element
  // NOTE: it gives socketId with stream which sayas, whose stream it is so
  // you can set that stream to perticular vido element, because you would have
  // multiple video elements at a time
  chatInstance.streamOfIncomingCall((stream, socketId) => {
    const remoteVideo = document.getElementById(PeerConnection.getVideoElementID(socketId));
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  });

  // when you call to someone, below listner will automatically start giving
  // the stream of socket to whome you called
  // NOTE: it gives socketId with stream, which tells you to whome you called
  // so whose video element you have to fill with incoming stream
  chatInstance.streamOfOutgoingCall((stream, socketId) => {
    const remoteVideo = document.getElementById(PeerConnection.getVideoElementID(socketId));
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  });

  // When you want to call someone, you just have to call below function,
  // chatInstance.callToSocket(socketId);
  // it will automatically start your chat, the reciever will
  // automatically recieve the call and start showing the video from 
  // startOfIncomingCall of the reciever
  // And, will automatically start showing the recievers video,
  // to your video element by using streamOfOutgoingCall of sender
  async function callUser(socketId) {
    await chatInstance.callToSocket(socketId);
  }


  function unselectUsersFromList() {
    const alreadySelectedUser = document.querySelectorAll(
      ".active-user.active-user--selected"
    );

    alreadySelectedUser.forEach(el => {
      el.setAttribute("class", "active-user single-user");
    });
  }

  function createUserItemContainer(socketId) {
    const userContainerEl = document.createElement("div");

    const usernameEl = document.createElement("p");

    userContainerEl.setAttribute("class", "active-user single-user");
    userContainerEl.setAttribute("id", socketId);
    usernameEl.setAttribute("class", "username");
    usernameEl.innerHTML = `Socket: ${socketId}`;

    userContainerEl.appendChild(usernameEl);

    const videoEl = document.createElement("video");
    videoEl.setAttribute("autoplay", "");
    videoEl.setAttribute("class", "remote-video");
    videoEl.setAttribute("id", PeerConnection.getVideoElementID(socketId));
    // <video autoplay class="remote-video" id="remote-video"></video>
    userContainerEl.appendChild(videoEl);

    userContainerEl.addEventListener("click", () => {
      unselectUsersFromList();
      userContainerEl.setAttribute("class", "active-user active-user--selected single-user");
      const talkingWithInfo = document.getElementById("talking-with-info");
      callUser(socketId);

      

    });

    return userContainerEl;
  }

  

  function updateUserList(socketIds) {
    const activeUserContainer = document.getElementById("active-user-container");
    
    socketIds.forEach(socketId => {
      const alreadyExistingUser = document.getElementById(socketId);
      if (!alreadyExistingUser) {
        const userContainerEl = createUserItemContainer(socketId);

        activeUserContainer.appendChild(userContainerEl);
      }
    });

    //mhear
    for(var i = 0; i < activeUserContainer.childNodes.length; i++){
        var oChild = activeUserContainer.childNodes[i];
        if(socketIds.indexOf(oChild.id) === -1) {
          activeUserContainer.removeChild(oChild);
        }
    }
  }

}
