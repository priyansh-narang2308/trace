// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {TraceCheckpoint} from "../src/TraceCheckpoint.sol";

contract DeployTraceCheckpoint is Script {
    TraceCheckpoint public traceCheckpoint;

    function run() public {
        vm.startBroadcast();

        traceCheckpoint = new TraceCheckpoint();

        vm.stopBroadcast();
    }
}
