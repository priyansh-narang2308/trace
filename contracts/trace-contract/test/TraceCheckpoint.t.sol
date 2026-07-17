// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {TraceCheckpoint} from "../src/TraceCheckpoint.sol";

contract TraceCheckpointTest is Test {
    TraceCheckpoint public trace;
    
    address public owner = address(1);
    address public collaborator1 = address(2);
    address public nonCollaborator = address(3);

    function setUp() public {
        trace = new TraceCheckpoint();
    }

    function test_CreateProject() public {
        vm.prank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);

        TraceCheckpoint.Project memory project = trace.getProject("proj-1");
        assertEq(project.owner, owner);
        assertEq(project.name, "Test Project");
        assertEq(project.description, "Description");
        assertTrue(project.isPublic);
        assertGt(project.createdAt, 0);
    }

    function test_RevertIfProjectExists() public {
        vm.prank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);

        vm.expectRevert("Project exists");
        vm.prank(owner);
        trace.createProject("proj-1", "Another Project", "Another Desc", false);
    }

    function test_AddCollaborator() public {
        vm.prank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);

        vm.prank(owner);
        trace.addCollaborator("proj-1", collaborator1);

        TraceCheckpoint.Project memory project = trace.getProject("proj-1");
        assertEq(project.collaborators.length, 1);
        assertEq(project.collaborators[0], collaborator1);
    }

    function test_RevertIfNotProjectOwnerAddsCollaborator() public {
        vm.prank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);

        vm.expectRevert("Not owner");
        vm.prank(collaborator1);
        trace.addCollaborator("proj-1", nonCollaborator);
    }

    function test_CreateCheckpoint() public {
        vm.startPrank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);
        trace.addCollaborator("proj-1", collaborator1);
        vm.stopPrank();

        bytes32 checkpointHash = keccak256("test-hash");
        address[] memory cpCollaborators = new address[](1);
        cpCollaborators[0] = collaborator1;

        vm.prank(collaborator1);
        trace.createCheckpoint(
            checkpointHash,
            "proj-1",
            "Commit msg",
            cpCollaborators,
            TraceCheckpoint.CheckpointType.GIT_COMMIT
        );

        TraceCheckpoint.Checkpoint memory checkpoint = trace.getCheckpoint(checkpointHash);
        assertEq(checkpoint.creator, collaborator1);
        assertEq(checkpoint.projectId, "proj-1");
        assertEq(checkpoint.description, "Commit msg");
        assertEq(uint(checkpoint.checkpointType), uint(TraceCheckpoint.CheckpointType.GIT_COMMIT));

        bytes32[] memory projectCheckpoints = trace.getProjectCheckpoints("proj-1");
        assertEq(projectCheckpoints.length, 1);
        assertEq(projectCheckpoints[0], checkpointHash);
    }

    function test_RevertIfNotCollaboratorCreatesCheckpoint() public {
        vm.prank(owner);
        trace.createProject("proj-1", "Test Project", "Description", true);

        bytes32 checkpointHash = keccak256("test-hash");
        address[] memory cpCollaborators = new address[](0);

        vm.expectRevert("Not collaborator");
        vm.prank(nonCollaborator);
        trace.createCheckpoint(
            checkpointHash,
            "proj-1",
            "Commit msg",
            cpCollaborators,
            TraceCheckpoint.CheckpointType.GIT_COMMIT
        );
    }
}
