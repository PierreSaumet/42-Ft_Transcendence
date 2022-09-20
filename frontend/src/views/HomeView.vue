<template>
  
  <button class='button-loginasguest' @click="createGuest()">Login as a guest</button>
  <p class="welcome"> Welcome to our wonderful transcendence</p>
  <p class="welcome2"> Please choose how to Login</p>
  <div>
    <a class='button-login42' href="https://api.intra.42.fr/oauth/authorize?client_id=a20f591ce8448d5fc7037bd010037bd02b13125eb08ccc5ad6fd0a557f78f953&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauthentification%2Ftest&response_type=code&scope=public&state=01234567899876543210">
              Login with 42
  </a>
</div>
</template>

<script lang="ts">

import router from '@/router';
import store from '@/store';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export default {
  name: 'HomeView',
  data: function () {
    return {
      login42: '',
      avatar42: '',
      auth42: process.env.VUE_APP_AUTH42,
      imgUrl:require('../assets/welc22.jpeg'),
    }
  },
  mounted: function() { 
		if (store.state.isLoggedIn == true) {
			router.push("/profile");
		return ;
		}
	},
  methods: {
    create42: function () {
        store.dispatch('create42');
    },
    createGuest: function() {
      let res = '';
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLengh = characters.length;
      for ( var i = 0; i < 10; i++)
        res += characters.charAt(Math.floor(Math.random() * charactersLengh));
      let avatar = 'https://cdn.intra.42.fr/users/medium_default.png';


      store.dispatch('createGuest', {
        login42: res,
        avatar42: avatar,
      }).then(function () {        
        store.dispatch('loginGuest', {
          login42: res,
          avatar42: avatar,
        }).then(function () {
          router.push('profile');
        }), function () {
        }
      }), function () {
      }
    }
  }
}
</script>

<style>
body {
    background-image:url('@/assets/noir2.jpg');
    background-size:100%;
}

.button-loginasguest {
  font-family: cursive;
  padding: 1% 2%;
  text-align: center;
  text-decoration: underline;
  display: inline-block;
  transition-duration: 0.4s;
  cursor: pointer;
  text-shadow: 4px 4px 5px rgb(122, 100, 100);
  color: rgb(255, 255, 255); 
  border: 3px solid rgb(255, 255, 255);
  background-color: transparent;
  position: fixed;
  border-radius: 12%;
  top: 73%;
  font-size: 2vmin;
  right: 40.9%;
  font-style: oblique;
}
.button-login42 {
  font-family: cursive;
  padding: 1% 2%;
  text-align: center;
  text-decoration: underline;
  display: inline-block;
  transition-duration: 0.4s;
  cursor: pointer;
  text-shadow: 4px 4px 5px rgb(122, 100, 100);
  color: rgb(255, 255, 255); 
  border: 3px solid rgb(255, 255, 255);
  border-radius: 12%;
  position: fixed;
  top: 73%;
  font-size: 2vmin;
  right: 25.8%;
  font-style: oblique;
}

.welcome{
  position: fixed;
  font-family: cursive;
  text-transform: uppercase;
  font-style: oblique;
  font-style: italic;
  text-shadow: 4px 4px 5px rgb(122, 100, 100);
  text-align: center;
  text-transform: uppercase;
  top: 38%;
  font-size: 4.5vmin;
  color: white;
  left: 23%;
}

.welcome2{
  position: fixed;
  text-transform: uppercase;
  font-style: oblique;;
  text-shadow: 4px 4px 5px rgb(122, 100, 100);
  text-align: center;
  text-transform: uppercase;
  top: 62%;
  font-size: 2.5vmin;
  color: white;
  left: 53%;
}

.img {
  position: fixed;
  left: 26%;
  top: 20%;
  width: 50%;
  height: 50%;
  border: 1px solid #ddd;
  border-radius: 10%;
  padding: 5px;
}

</style>



