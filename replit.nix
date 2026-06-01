# This is a Nix expression defining a development environment.
# It takes the package set `pkgs` as input and exposes dependencies
# via the `deps` attribute.

{pkgs}:  # Input argument: 'pkgs' is the Nixpkgs package set
  {
    # List of packages to include in the development environment
    deps = [
      pkgs.jq   # 'jq' is a lightweight command-line JSON processor
      pkgs.vim  # 'vim' is a text editor
    ];
  }
