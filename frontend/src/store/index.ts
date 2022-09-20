/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint-disable */ 
import { createStore } from 'vuex'
import { ref } from 'vue';
import router from '@/router';

const axios = require('axios').default;

const instance = axios.create({
    baseURL: '/api'
})

// instance.interceptors.response.use(function (response:any) {
//     // Any status code that lie within the range of 2xx cause this function to trigger
//     // Do something with response data
//     return response;
//   }, function (error:any) {
//     // // // console.log('error interceptor');
//     return
//   });

const store = createStore({
    state: {
        status: '',
        isLoggedIn: false,
        guest: false, 
        isEnterCode: false,
        user: {
            id: '',
            login42: '',
            avatar42: '',
            wins: 0,
            losses: 0,
            tt_games: 0,
            score: 0,
            ladderpos: 0,
            status: '',
            isTwoFactorAuthentificationEnabled: false,
            token: '',
            username: '',
            avatarId: '',
            qrcode: ref(null),
            avatar: ref(null),
            watchGame: '',
        },
        allUsers: [
            { id: '', username: '', status: ''}
        ],
        friendsList: [
            {username: '', status: ''}
        ],
        matchHistory: [
            '',
        ],
        avatarProfile: ref(null),
    },
    mutations: {
        updateWatchGame: function (state, game) {
            state.user.watchGame = game;
        },
        isEnterCodecommit: function (state, code) {
            state.isEnterCode = code;
        },
        clearMatchHistory: function (state) {
            state.matchHistory = [];
        },
        addMatchHistory: function (state, match) {
            state.matchHistory.push(match);
        },
        clearFriends: function (state) {
            state.friendsList = [];
        },
        addFriend: function (state, user ) {
            state.friendsList.push(user);
        },
        clearUsers: function ( state) {
            state.allUsers = [];
        },
        addUsers: function (state, user) {
            state.allUsers.push(user);
        },
        logoutUser: function (state) {
            if (state.guest == false)
                localStorage.clear();
            state.user.id = '';
            state.user.login42 = '';
            state.user.avatar42 = '';
            state.user.wins = 0;
            state.user.losses = 0;
            state.user.tt_games = 0;
            state.user.score = 0;
            state.user.ladderpos = 0;
            state.user.status = '';
            state.user.isTwoFactorAuthentificationEnabled = false;
            state.user.token = '';
            state.user.username = '';
            state.user.avatarId = '';
            state.user.qrcode = ref(null);
        },
        setStatus: function (state, status) {
            state.status = status;
        },
        logUserGuest(state, user ) {
            state.user = user;
            state.guest = true;
        },
        logUser: function (state, user) {
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;
        },
        isLogged: function (state, islog) {
            state.isLoggedIn = islog;
        },
        updateUsername: function (state, username) {
            state.user.username = username;
        },
        update2Factor: function (state, TwoFactor) {
            state.user.isTwoFactorAuthentificationEnabled = TwoFactor;
        },
        updateQrCode: function (state, qrcode) {
            let test = ref(null);
            test.value = qrcode;
            state.user.qrcode = test;
        },
        updateAvatarId: function(state, avatarID) {
            state.user.avatarId = avatarID;
        },
        updateavatarProfile: function(state, avatar) {
            let test = ref(null);
            test.value = avatar;
            state.avatarProfile = test;
        },
        updateavatar42: function(state, avatar) {
            let test = ref(null);
            test.value = avatar;
            state.user.avatar = test;
        },
        updateVictory: function(state, victory) {
            state.user.wins = victory;
        },
        updateLoose: function(state, losses) {
            state.user.losses = losses;
        },
        updateGamesPlayed: function(state, games) {
            state.user.tt_games = games;
        },
        updateLadderPos: function (state, pos) {
            state.user.ladderpos = pos;
        },
        updateScore: function (state, score) {
            state.user.score = score;
        },
        updateStatus: function (state, status) {
            state.user.status = status;
        }
    },
    actions: {
        getFriendStatus: ({commit}, username: string) => {
            instance.get('/user/find/' + username)
            .then( function (response:any) {
                // // // // console.log('On atrouve le uer ? = ', response.data)
                // // // // console.log('On atrouve le uer22 ? = ', response.data.watchGame)
                router.push('/game/' + response.data.watchGame)
                return response.data;
            })
        },
        watchGame: ({ commit }, code : string) => {

            instance.post('/user/postWatchCode', {code})
            .then( function () {
                commit('updateWatchGame', code);
            })

        },
        relou: ({commit}, value: boolean) => {
            commit('isEnterCodecommit', value)
        },
        getMatchHistory: ({commit}) => {
            commit('clearMatchHistory');
            instance.get('/user/getMatchHistory')
            .then (function(response:any) {
                // // // // console.log('Bingo get match history ', response);
                if (response.data.length > 0) {
                    for (const item of response.data) {
                        // // // // console.log('history 1 = ', item);
                        commit('addMatchHistory', item);
                    }
                }

            })
            .catch (function (error: any) {
                // // // // console.log('errror mathc history ', error);
            })

        },
        updateMatchHistory: ({ commit }) => {
            instance.post('/user/matchHistory', {username_v1: 'Pierre', username_v2: 'RedaLove', score_v1: '2', score_v2: '5'})
            .then(function (response:any) {
                
                //if (response.data.sucess == true)
                    // // // // console.log('Good = ', response);
            })
            .catch( function (error:any) {
                // // // // console.log('error upate history');
            })
        },
        getFriends: ({ commit }) => {

            commit('clearFriends');
            instance.get('/user/friends')
            .then( function (response:any) {
                // // // // console.log('Dans response getfriends', response);
                // // // // console.log("respo:", response)
                for (const item of response.data)
                {

                    instance.get('/user/status/' + item)
                    .then(function(response:any) {
                        // // // // console.log('get statys friend res = ', response.data);

                        const friend = {username: item, status: response.data};
                        if (!store.state.friendsList.includes(friend))
                            commit('addFriend', friend);
                    })
                }
            })
            .catch( function (error: any) {
                // // // // console.log("Error get friends", error);
            })

        },
        delFriend: ({commit }, username: string) => {
            commit;
            // // // // console.log('Dans remove friend, username =', username);
            instance.post('/user/delfriend', {username: username})
            .then( function (response:any) {
                if (response.data.sucess == true) {
                    // resolve(response);
                    // // // // console.log('data response def friend', response.data);
                    store.dispatch('getFriends');
                }
                else
                    alert(`${response.data.message}`);
            })
            .catch( function (error: any) {
                // // // // console.log('ERROR response def friend', error);
            })
        },
        addFriend: ({ commit }, username: string) => {
            return new Promise((resolve, reject) => {
                commit;
                 instance.post('/user/addfriend', {username: username})
                .then( function (response:any) {
                    if (response.data.sucess == true) {
                        resolve(response);
                        store.dispatch('getFriends');
                    }
                    else
                        alert(`${response.data.message}`);
                })
                .catch( function (error: any) {
                    reject(error);
                })


            })
        },
        getLadderPosition: ({ commit }) => {
            instance.get('/user/ladderPosition')
            .then( function (response:any) {
                let res = response.data + 1;
                commit('updateLadderPos', res);
            })
        },
        getAllUsers: ({ commit }) => {

            commit('clearUsers');
            instance.get('/user/').
            then (function (response:any) {
                for (const Object of response.data) {
                    if (Object.id != store.state.user.id) {
                        const user = {id: Object.id, username: Object.username, status: Object.status, score: Object.score};
                        commit('addUsers', user);   
                    }
                    

                }
                // // // // console.log('Apres requete all user = ', store.state.allUsers);
            })
            .catch( function (error: any) {
                // // // // console.log('error get all users');
            })

        },
        authentificate2F: ({ commit }, elem: any) => {
            return new Promise((resolve, reject) => {
                // // // // console.log('test = ', elem);
                const uri = window.location.search.substring(1);
                const params = new URLSearchParams(uri);
                // // // // console.log(`param: ${params.get('Authentication')}`)
                instance.post('2fa/authenticate', { param: params.get('Authentication'),code: elem.code, user: elem.user})
                .then( function (response:any ) {
                    // // // // console.log('Authentificatin food ? ', response);
                    commit("logUser", response.data);
                    commit("isLogged", true);
                    resolve(response);
                })
                .catch( function (error:any) {
                    alert('Error, code invalid');
                    reject(error);
                })  

            })

        },
        validationCode: ({ commit }, code :string ) => {
            instance.post('2fa/turn-on', {code: code})
            .then( function (response :any ) {
                if (response.status == 200) {
                    // // // // console.log(' good ?', response);
                    // // // // console.log('avat2aut act ? = ',store.state.user.isTwoFactorAuthentificationEnabled);
                    if (store.state.user.isTwoFactorAuthentificationEnabled == true)
                        commit('update2Factor', false);
                    else
                        commit('update2Factor', true);
                    // // // // console.log('apres2aut act ? = ',store.state.user.isTwoFactorAuthentificationEnabled);
                }
            })
            .catch( function () {
                alert('Error, code invalid');
            })
        },
        testBase64: ({ commit }, file: any) => {
            commit;
            return new Promise((resolve, reject) => {
                const readable = new FileReader();
                readable.readAsDataURL(file);
                readable.onload = () => resolve(readable.result);
                readable.onerror = error => reject(error);     
            });
        },
        getQrCode: ({ commit }, user_id:any) => {
            return new Promise((resolve, reject) => {
                // // // // console.log('ici = ', user_id);
                instance.post('2fa/generate', {id: user_id}, { responseType: 'blob'})
                .then( function (response:any) {
                    if (response.status == 201) {
                        store.dispatch('testBase64', response.data)
                        .then( function (response: any) {
                            commit('updateQrCode', response);
                        })
                        resolve(response);
                    }
                })
                .catch(function (error:any) {
                    reject(error);
                })
            })

        },
        update2Factor: ({commit}, val) => {
            commit('update2Factor', val);
        },
        create42: ({ commit }) => {
            // // // // console.log('Dans index create42');
            instance.get(process.env.VUE_APP_AUTH42)
            .then( function (response:any) {
                // // // // console.log('ca marche ouiiiiiiiiiiiiiiiiii ', response);
                alert('You are prompt to change your username in the edit page');
            })
            .catch(function (error: any) {
                // // // // console.log('marche pas', error);
            })
        },
        createGuest: ({commit}, userInfos) => {
            return new Promise((resolve, reject) => {
                instance.post('/authentification/registerguest', userInfos)
                .then(function (response:any) {
                    commit('setStatus', 'created');
                    resolve(response);
                })
                .catch(function (error:any) {
                    // // // // console.log('error post = ', error);
                    commit('setStatus', 'error_create_guest');
                    reject(error);
                });
            })
        },
        loginGuest: ({commit}, userInfos) => { 
            return new Promise((resolve, reject) => {
                commit('setStatus', 'loading');                         // a supprimer je pense

                instance.post('/authentification/login', {
                    login42: userInfos.login42,
                    avatar42: userInfos.avatar42
                }) 
                .then(function (response:any) {

                    // commit("ma fonction ", )
                    // // // // console.log('fin de requete login = ', response);
                    commit("logUserGuest", response.data);
                    commit('isLogged', true);
                    alert('You are prompt to change your username in the edit page');
                    resolve(response);
                })
                .catch(function (error:any) {
                    // // // // console.log('error post = ', error);
                    commit('setStatus', 'error_login_guest');
                    reject(error);
                });
            })
        },
        login: ({ commit }, obg:any) => {

            commit("logUser", obg.data);
            // // // // // console.log('is TWO fac? ')
            // // // // // console.log('ici?')
            // if (store.state.user.isTwoFactorAuthentificationEnabled == true)
            // {
            //     // // // // console.log('bingo?')
            //     router.push('/TwoFactor');
            //     // // // // console.log('la?')
            //     commit("isLogged", true);
            //     return ;
            // }
            commit("isLogged", true);
        },
        logout: ({commit}) => {
            if (store.state.isLoggedIn == false)
                return ;
            instance.put('/user/offline')
            .then(function (res:any) {
                instance.post('/authentification/logout')
                .then( function (response:any) {
                    if (response.status == 201) {
                        commit("logoutUser");
                        commit("isLogged", false);
                        router.push("/");
                        return ;
                    }
                })
                .catch( function (error:any) {
                    // // // // console.log(error.toJSON());
                })
            })
           
        },
        changeUsername: ({commit}, obj) => {

            instance.post('/user/changeUserName', {id: store.state.user.id, username: obj})
            .then(function (response:any) {
                
                if (response.data.sucess == true)
                    commit('updateUsername', obj);
                else
                    alert('Username already taken');
            })
            .catch(function (error:any) {
                // // // // console.log('mince', error);
            });
        },
        updateAvatar: ({commit}, formData) => {   // requete post pour mettre l;image
            commit;
            // // // // console.log('Dans update avatar = ', formData);
            instance.post('/user/uploadAvatar/' + store.state.user.id, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            .then(function (response:any) {
                // // // // console.log('apres le post, response = ', response)
                instance.get('/user/avatarId/' + store.state.user.id)  // get pour recuperer l;image
                .then(function (response:any) {
                    // // // // console.log('apres le get avatar = ', response );
                    // // // // console.log('apres le get avatar = ', response.data );
                    commit('updateAvatarId', response.data);   // je store l'id de l;inage
                    store.dispatch('getAvatar')
                })
                .catch( function (error: any) {

                })
            })
            .catch(function (error:any) {
            });
        },
        getUserByUname: ({ commit }, username) => {
            return new Promise((resolve, reject) => {
                instance.get(`/user/find/${username}`)
                .then( function (response:any ) {
                    if (response.status == 200) {
                        // // // // console.log(response.data);
                        resolve(response.data);
                    }
                })
                .catch(function (error:any) {
                    resolve(null);
                })
            })
        },
        getAvatarByUname: ({ commit }, avatarId) => {
            // return new Promise((resolve, reject) => {
                // // // // console.log('avatar id ', avatarId);
                instance.get('/localFiles/' + avatarId, { responseType: 'blob'})
                .then( function (response:any) {
                    // // // // console.log('get avatar response = ', response);
                    store.dispatch('testBase64', response.data)
                    .then( function (response: any) {
                        commit('updateavatarProfile', response)
                        //  // // // console.log('bingo ??????????/', response);
                    //     resolve(response);
                       
                    })
                    // resolve(response);
                })
                .catch(function (error: any) {
                    // // // // console.log('errror get avatar');
                    // resolve(null);
                })

            // })
        },
        getAvatar: ({ commit }) => {
            return new Promise((resolve, reject) => {
                instance.get('/localFiles/' + store.state.user.avatarId, { responseType: 'blob'}) // requete get
                .then( function (response:any) {
                    // // // // console.log('get avatar response = ', response);
                    store.dispatch('testBase64', response.data)
                    .then( function (response: any) {
                        commit('updateavatar42', response);
                        // // // // console.log('bingo ??????????/ on a store limage');
                    })
                    resolve(response);
                })
                .catch(function (error: any) {
                    // // // // console.log('errror get avatar');
                    reject(error);
                })

            })
        },
        getVictory: ({ commit}) => {
            instance.get('/user/getVictory')
            .then( function (response:any) {
                // // // // console.log('total victory ', response.data);
                commit('updateVictory', response.data);
            })
        },
        putVictory: ({ commit }) => {
            // // // // console.log('dans put victory');
            instance.put('/user/putVictory')
            .then( function (response:any) {
                // // // // console.log('response = ', response);

            })
        },
        getLoose: ({ commit}) => {
            instance.get('/user/getLoose')
            .then( function (response:any) {
                // // // // console.log('total  Loose ', response.data);
                commit('updateLoose', response.data);
            })
        },
        putLoose: ({ commit }) => {
            // // // // console.log('dans putLoose');
            instance.put('/user/putLoose')
            .then( function (response:any) {
                // // // // console.log('putloose  = ', response);

            })
        },
        getGamesPlayed: ({ commit }) => {
            instance.get('/user/gamesPlayed')
            .then( function (response:any) {
                // // // // // console.log('total parties jouees ', response.data);
                commit('updateGamesPlayed', response.data);
            })
        },
        getScore: ({ commit }) => {
            commit;
            instance.get('/user/getScore')
            .then( function (response:any) { 
                // // // // // console.log('score ', response.data);
                commit('updateScore', response.data);
            })
        },
        putInGame: ({ commit }) => {
            commit;
            instance.put('user/putIngame')
            .then( function (response:any) {
                // // // // console.log(store.state.user.id,'status avatnt  ', store.state.user.status);
                commit('updateStatus', 'in_game');
                // // // // console.log(store.state.user.id,'status apres  ', store.state.user.status);
            })
        },
        putOnline: ({ commit }) => {
            commit;
            instance.put('user/online')
            .then( function (response:any) {
                // // // // // console.log('GOOD online ', response.data);
                commit('updateStatus', 'online');
            })
        },
        putFullscore: ({ commit }, data) => {
            // // // // console.log('test = ', data);
            commit;
            instance.post('/user/matchHistory', {id_p1: data.id_p1, score_p1: data.score_p1, id_p2: data.id_p2, score_p2: data.score_p2, winner: data.winner, id_game: data.id_game})
            .then( function (response:any) {
                // // // // console.log('GOOD Parfait??? ', response);
            })
            .catch( function (error:any) {
                    // // // // console.log('error upate history');
            })
        },
        putoffline: ({ commit }) => {
            // // // // console.log('GOOD offline ', );
            instance.put('user/offline')
            .then( function (response:any) {
                // // // // console.log('GOOD offline ', response.data);
                commit('updateStatus', 'offline');
            })
        },

    }
})  

export default store;