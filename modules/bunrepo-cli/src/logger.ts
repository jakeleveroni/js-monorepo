import { debug as _debug, error as _error, info as _info } from '@actions/core';

export function logger() {
  const isCI = process.env.CI;

  function log(message: string) {
    console.log(message);
  }

  function debug(message: string) {
    if (isCI) {
      _debug(message);
    } else {
      console.debug(message);
    }
  }

  function info(message: string) {
    if (isCI) {
      _info(message);
    } else {
      console.info(message);
    }
  }

  function error(message: string) {
    if (isCI) {
      _error(message);
    } else {
      console.error(message);
    }
  }

  return {
    log,
    debug,
    info,
    error,
  };
}
