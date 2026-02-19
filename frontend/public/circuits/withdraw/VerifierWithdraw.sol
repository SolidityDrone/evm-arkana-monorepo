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
    uint256 constant deltax1 = 20454317770197812070051681233120502523671902508913690312286884599677179894338;
    uint256 constant deltax2 = 9452481688753470555031620355340826684008082889686238682494350271894299153009;
    uint256 constant deltay1 = 3115558585289798623619861907291808265509855685513293783043796866119072125407;
    uint256 constant deltay2 = 11955603819372133362874632212065274831037138127471400093056476302401192384839;

    
    uint256 constant IC0x = 14476335278109839126538665143122240888563056630153963595661915266248202181278;
    uint256 constant IC0y = 16839021198103681039733585798614633569760977906890632632024266613508133519535;
    
    uint256 constant IC1x = 1337961130145103710604481053087026295941759646267134163537487389878876295528;
    uint256 constant IC1y = 14847757335666860926704340099946321213680313238057332230291332758278967565284;
    
    uint256 constant IC2x = 16970137875568945766380899887153130945965077384274786168827608977561715750806;
    uint256 constant IC2y = 2714110214667447445328677553407381821182096928756398628667099763972517606198;
    
    uint256 constant IC3x = 15283143541669044004450781105629363513676594322302998093557483508289141462108;
    uint256 constant IC3y = 17009543570382305609993339528125832999192415858018734962464945958222728901438;
    
    uint256 constant IC4x = 21731927740146796994301129629666434623070242763321856155514319407779949866316;
    uint256 constant IC4y = 16127065199093793130353635998416045541570058206719155588915454455251203814946;
    
    uint256 constant IC5x = 17800239355177001243734868020280297773366433138097938169521531861891590844361;
    uint256 constant IC5y = 13250321338733613411751083718841285930025347476698803617996591711868937109728;
    
    uint256 constant IC6x = 20225747004899043285167427982529172057732649294628313252330052930367769669529;
    uint256 constant IC6y = 21425076199619747295069481867895195659935616351045947831990946444091957398417;
    
    uint256 constant IC7x = 12680546442207472872591566313058646626827019550240842305557118485187640449168;
    uint256 constant IC7y = 16425454293441759535493882132273023518561249805560294978776208989585261442369;
    
    uint256 constant IC8x = 6944352796548322157613140746255731871448278134894659041547629295622152951210;
    uint256 constant IC8y = 15650778224381563408761437914570731486888887920877153414538878411113243908907;
    
    uint256 constant IC9x = 19947014323371736018540087487328506722396611547387198097499788824350386275259;
    uint256 constant IC9y = 4445414055308186347638710494747860831512765934687491481812856478137689593200;
    
    uint256 constant IC10x = 15553150652836710323820555266569197332767196333634991149318361196583450716127;
    uint256 constant IC10y = 15427858516456578799688765411681290486229316335590603901869434306540291904632;
    
    uint256 constant IC11x = 14002382795918126364823104541533064455995736401062257616372611125377280104792;
    uint256 constant IC11y = 2867200327604707915729636760102818066472714437425033223391385789155152359466;
    
    uint256 constant IC12x = 14605351386207567042443439596486498797212863867001733182236526454034143405623;
    uint256 constant IC12y = 3562028213159606967778011371318320428982212667314302617125708440276837057323;
    
    uint256 constant IC13x = 1270381578187714439723392460736877693650233315198565982405130210698769129928;
    uint256 constant IC13y = 10017940862234446518820370136974905592987902223020858443547929243639239557674;
    
    uint256 constant IC14x = 7264215341077820367922399946119272512112077062006998133906488897982320570187;
    uint256 constant IC14y = 9350800941453564555428639733715013666448921115041008088201760566345105492169;
    
    uint256 constant IC15x = 7191802583656985761346518773461010615023641997623623505718259042215170799561;
    uint256 constant IC15y = 7491115634452787754695118632035237080920442553628481101595993426262152937774;
    
 
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
