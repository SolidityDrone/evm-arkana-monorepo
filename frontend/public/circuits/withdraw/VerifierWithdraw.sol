// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 7074912863554817505474784013834065099455676205078629983330316682199339996391;
    uint256 constant deltax2 = 15690048466877865624711026852987701687134909082123239965276238026092387522987;
    uint256 constant deltay1 = 15657082537533113475156328510828524142442368728103319979124772559774660611359;
    uint256 constant deltay2 = 5552085627109462276303106202346153112531743689626612206314676312131249191337;

    
    uint256 constant IC0x = 12820520244836380152645525531940432586320091488020553564005238775713318261372;
    uint256 constant IC0y = 2664547684594575167388506358614825698466865334615791834815747194561198163583;
    
    uint256 constant IC1x = 5652311430339773691105480686828331649761537006472823813308941681928214016176;
    uint256 constant IC1y = 9056174010049692640129083761332008830392246108661051653425441084559266192556;
    
    uint256 constant IC2x = 6869795774801740832077948728894441631444730781208698304418299290721500592353;
    uint256 constant IC2y = 19907942812768717170268949408969979637126248267670504988384070362655552542504;
    
    uint256 constant IC3x = 8450084284708993537541385092453206045109002406373878145110249053697286592663;
    uint256 constant IC3y = 11299193569227906273603028617350629693218924517952657470939201131903231207101;
    
    uint256 constant IC4x = 20820129611527324241507793546400980535506269156249043475701133812832177334724;
    uint256 constant IC4y = 9760551881020894081236368935181999548698189105828423603725052821513592237401;
    
    uint256 constant IC5x = 5935074021275264940501438349275754160705568316683204893994799088478486947494;
    uint256 constant IC5y = 3378117659150694521879983643984169571459327224388739410462482044131510841192;
    
    uint256 constant IC6x = 4219541581711812333971311283158854127559134830232595094377843153778380137204;
    uint256 constant IC6y = 15889610678413565156319468660567244880239133810967639742452283525650968055931;
    
    uint256 constant IC7x = 6984307148832356148863765550655242866699347280774295301434887916432662149175;
    uint256 constant IC7y = 20744654428176483653634388859185025788574237192582522769508580455349044537260;
    
    uint256 constant IC8x = 9234316687874928690244670128290487928884996553135381150242423995015257639424;
    uint256 constant IC8y = 7185215431139166327006975520463847723716059581409145063059411429238150442815;
    
    uint256 constant IC9x = 8253538187213314868359600947894147307497877840555811780646433026299236294242;
    uint256 constant IC9y = 9117795285660432250167691691929126543201427713970817090113959132141630538051;
    
    uint256 constant IC10x = 18528401169577636901243673663978404344257707209778617901015294680826045377112;
    uint256 constant IC10y = 10801787856626869618964843070463553010047944428480765343528839302437996104955;
    
    uint256 constant IC11x = 19522914314001379711587413931386614967683381564592297499978696876586013255667;
    uint256 constant IC11y = 6351379290357470733248087235273051551075850937717588146960075288093718523513;
    
    uint256 constant IC12x = 10584641693907152431838846223377737872559521339018357157936317584249514576675;
    uint256 constant IC12y = 16167976170136936732721592772974337165918549675716839893091203714286549434657;
    
    uint256 constant IC13x = 12362216115004805966941204266895369921500340545382237329175356728446888389063;
    uint256 constant IC13y = 17621531314799100077455593114148540491575932568853350578507119672035379493992;
    
    uint256 constant IC14x = 8420849385520397884934082071455088727148622002135083043644043014502427789734;
    uint256 constant IC14y = 10800389410100559901323617132051586787518358431399045302055125849547089463779;
    
    uint256 constant IC15x = 3106969082394290909311230667327114506860714050882082743801434261654695773730;
    uint256 constant IC15y = 15444406212362894572683068417328076122878729631018216469152065809204833666296;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[15] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
