const $ = Dom7;

// NCMBの初期化用
const event = window.cordova ? 'deviceready' : 'DOMContentLoaded';
document.addEventListener(event, async (e) => {
  const config = await (await fetch('./js/config.json')).json();
  window.ncmb = new NCMB(config.applicationKey, config.clientKey);
  window.app = new Framework7({
    name: 'My App', // App name
    theme: 'auto', // Automatic theme detection
    el: '#app', // App root element
    // App store
    store: store,
    // App routes
    routes: routes,
  });

  $('.logout').on('click', async (e) => {
    e.preventDefault();
    try {
      await ncmb.User.logout();
    } catch (e) {
      // 駄目だった場合は認証情報を削除
      localStorage.removeItem("NCMB/"+ncmb.apikey+"/currentUser");
    }
    location.reload();
  });
});

// プロフィールオブジェクトをポインターの形式に変換する
const profileToPointer = (profile) => {
  return {
    __type: "Pointer",
    className: "UserProfile",
    objectId: profile.objectId
  };
};
