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
    uint256 constant deltax1 = 11238828045727140195231575211425548889998458941403116219469181551311565097964;
    uint256 constant deltax2 = 12335960765327348053915408158247512666227414007007620614612033532527712740087;
    uint256 constant deltay1 = 14044602625479632756295395675596602346344893588763260557983682554863551899590;
    uint256 constant deltay2 = 19301358346030706198247895559206651208996647285582306511245564846914180604136;

    
    uint256 constant IC0x = 1415260345245472989843825756891616072643798225979233059732024518305068493673;
    uint256 constant IC0y = 17742524836089869368056532193852659178272395630384477463659057810370780863503;
    
    uint256 constant IC1x = 6495484410872807524886014032034386466769990773698536118339793242861934038970;
    uint256 constant IC1y = 2039942132836914406388560030433431782815715174629890092839567464987875892179;
    
    uint256 constant IC2x = 21872688676451173672445152082795846259852178641399611576389826021142352016478;
    uint256 constant IC2y = 21735009675770959155566768599522089410237625837081206627752594144692022004844;
    
    uint256 constant IC3x = 18204287764154685547402775093234905639548698155060600617146764185590388620024;
    uint256 constant IC3y = 2817341690536957901964629858687380765477342770032250635282230561997515392382;
    
    uint256 constant IC4x = 18898512608381115434397175728272920625043488319880840823191267473689262601065;
    uint256 constant IC4y = 4913600989519464656097584047011335376913990485509376756548317366039379278604;
    
    uint256 constant IC5x = 2273594055957101706647317486497361805782168191194148521799737945661544179611;
    uint256 constant IC5y = 16857889998738734887878213124837455548329433855472381057770528167487767708794;
    
    uint256 constant IC6x = 20155149440346888602482615536298840016973582665095610085370919643600712748218;
    uint256 constant IC6y = 2923161321713672764401561335143550974587356097608552708227162396782357055793;
    
    uint256 constant IC7x = 4592717746443207847831501828208970208636812498068289939459346450743088862995;
    uint256 constant IC7y = 7948244618193616380788184123036156606537894145157357453666947614173294133720;
    
    uint256 constant IC8x = 17899404945928056712996288962230119867849900086296021819668387886356806408881;
    uint256 constant IC8y = 14135280836388139774621282969413909006683128515751083383055851516669139825285;
    
    uint256 constant IC9x = 19828411059237604707362642402821527149374597247251018726897784713362247548516;
    uint256 constant IC9y = 6385066639653153064686294170937791817699857792280411780143737635859912579356;
    
    uint256 constant IC10x = 10118866273090106332119073340511168806964708922316562321482691295950347818210;
    uint256 constant IC10y = 12493955210537377855000542193969327955586006103058069340583320369078633546700;
    
    uint256 constant IC11x = 19414044495136732070809393779777502954338230949376553839131948097753777331450;
    uint256 constant IC11y = 18481199532736262485829155932439411682278620041766976553205107954097787434813;
    
    uint256 constant IC12x = 8562876231960945259945973371513222432018830108851803149971480895521112701918;
    uint256 constant IC12y = 6614301785310328424861431571518166305205827941346960867163693364288786057074;
    
    uint256 constant IC13x = 7031361737388754186312633899804771349869809566392846722715797589319534819706;
    uint256 constant IC13y = 16899938624710851261670647683328659604220427692758891215818126077763732233575;
    
    uint256 constant IC14x = 4990641450061436730939334773664399648725123009041398911634881096565994902985;
    uint256 constant IC14y = 3245234287517736725861356530127244513337659658141897496491067979961407341820;
    
    uint256 constant IC15x = 8181387510063902352685927950129637809728628222136098922989118785486134623396;
    uint256 constant IC15y = 20936202309607403019072014711728979933482262119232172735905975792394619012529;
    
 
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
