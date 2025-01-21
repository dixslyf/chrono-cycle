{
  pkgs,
  ...
}:

{
  languages = {
    nix.enable = true;
    typescript.enable = true;
    javascript = {
      enable = true;
      npm.enable = true;
    };
  };
}
