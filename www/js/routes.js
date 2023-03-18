// ログイン画面を表示する処理
const openLoginScreen = () => {
  return new Promise((res, rej) => {
    const id = setInterval(() => {
      // ログイン画面の準備ができるのを待つ
      if (!app.loginScreen) {
        return;
      }
      // 準備できていたらインターバル処理を止める
      clearInterval(id);
      // ログイン画面を表示
      app.loginScreen.open('#login-screen');
      // ログイン画面が開いた時の処理
      $('.login-screen').on('loginscreen:opened', (_) => {
        $('.login-screen .login-button').on('click', async (e) => {
          e.preventDefault();
          try {
            // ログイン&新規登録処理
            await loginOrSignup();
            // ログイン画面を閉じる
            app.loginScreen.close();
            // 自分のプロフィールを取得する
            const userProfile = await setUserProfile();
            // ストアに保存
            app.store.dispatch('setProfile', userProfile);
            res();
          } catch (_) {
            // ログインに失敗した場合はエラーメッセージを表示
            app.toast.create({
              text: 'ログインに失敗しました',
              position: 'center',
              closeTimeout: 2000,
            }).open();
          }
        });
      });
    }, 100);
  });
};

// ログイン&新規登録処理
const loginOrSignup = async () => {
  // フォームからユーザー名とパスワードを取得
  const params = app.form.convertToData($('.login-screen #login-form'));
  try {
    // ユーザー登録
    const user = new ncmb.User;
    await user
      .set("userName", params.username)
      .set("password", params.password)
      .signUpByAccount();
  } catch (_) {
    // 失敗した場合はすでにユーザーが存在する場合
  }
  // ログイン処理
  await ncmb.User.login(params.username, params.password);
  return true;
};

// 自分のプロフィールを取得、なければ作成する
const setUserProfile = async () => {
  // 自分のプロフィールを取得
  const user = ncmb.User.getCurrentUser();
  const UserProfile = ncmb.DataStore('UserProfile');
  let userProfile = await UserProfile
    .equalTo('user', {
      __type: 'Pointer',
      className: 'user',
      objectId: user.objectId,
    })
    .fetch();
  // プロフィールがあれば終了
  if (userProfile.objectId) {
    return userProfile;
  }
  // なければ作成
  const acl = new ncmb.Acl;
  acl
    .setPublicReadAccess(true)
    .setRoleWriteAccess('admin', true)
    .setUserWriteAccess(user, true)
    .setPublicWriteAccess(false);
  // デフォルトのプロフィールを作成
  userProfile = new UserProfile();
  await userProfile
    .set('user', user)
    .set('userName', user.userName)
    .set('image', '/assets/images/default.png')
    .set('profile', '')
    .set('posts', 0)
    .set('followers_count', 0)
    .set('followings_count', 0)
    .set('acl', acl)
    .save();
  return userProfile;
};

// 認証が必要な画面にアクセスした時の処理
const beforeEnter = async ({resolve, reject, router}) => {
  // 現在ログインしているユーザー情報を取得
	const currentUser = ncmb.User.getCurrentUser();
	// 認証していない場合はnullになる
	if (!currentUser) {
    // 認証画面を出して、処理が完了するのを待つ
    await openLoginScreen();
    // resolveを実行（元々指定されている画面を表示）
    resolve();
	}
	try {
		// データストアにダミーアクセス
		await ncmb.DataStore('Hello').fetch();
		// アクセスできればresolveを実行（元々指定されている画面を表示）
    const userProfile = await setUserProfile();
    app.store.dispatch('setProfile', userProfile);
		resolve();
	} catch (e) {
		// 駄目だった場合は認証情報を削除
		localStorage.removeItem("NCMB/"+ncmb.apikey+"/currentUser");
    // 認証画面を出して、処理が完了するのを待つ
    await openLoginScreen();
    // resolveを実行（元々指定されている画面を表示）
    resolve();
	}
};
const routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/home/',
    componentUrl: './pages/home.html',
    beforeEnter,
  },
  {
    path: '/users/:userName/',
    componentUrl: './pages/profile.html',
  },
  {
    path: '/about/',
    url: './pages/about.html',
  },
  {
    path: '/form/',
    url: './pages/form.html',
  },
  {
    path: '/catalog/',
    componentUrl: './pages/catalog.html',
  },
  {
    path: '/product/:id/',
    componentUrl: './pages/product.html',
  },
  {
    path: '/settings/',
    url: './pages/settings.html',
  },

  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    componentUrl: './pages/dynamic-route.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
