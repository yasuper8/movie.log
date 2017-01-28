function index(req, res) {
  res.json({
    message: "Welcome to Yasu's Movie Log!",
    // TODO: This documentation_url is for Travis Graff, an instructor for WDI 25 and WDI 27 :O
    documentation_url: "https://github.com/tgaff/api.md",
    base_url: "http://.herokuapp.com",
    endpoints: [
      {method: "GET", path: "/api", description: "Describes available endpoints"}
    ]
  });
}


module.exports.index = index;
