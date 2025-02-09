_:

{
  languages = {
    nix.enable = true;
    typescript.enable = true;
    javascript = {
      enable = true;
      npm.enable = true;
    };
  };

  services.postgres = {
    enable = true;
    initialDatabases = [
      { name = "chrono-cycle"; }
    ];
    listen_addresses = "localhost";
  };
}
