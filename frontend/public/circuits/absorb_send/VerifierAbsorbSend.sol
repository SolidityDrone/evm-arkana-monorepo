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
    uint256 constant deltax1 = 3807983387957890126648027634364773550874691461525613466201764728353369528877;
    uint256 constant deltax2 = 57158011930143484191651147689891029522113494048845539825178079188140886211;
    uint256 constant deltay1 = 2530389983103875588182234113684266423735668633391016554040746773553129972608;
    uint256 constant deltay2 = 6458252416380069270739179160333300434547134273534193296430861950481635250641;

    
    uint256 constant IC0x = 9581298562469489069849216215515389617446375427400095902622503736403075946636;
    uint256 constant IC0y = 9276915938110256861995925826815255286131407557090045012891926758168048964;
    
    uint256 constant IC1x = 4373297890451259741561669086244143607297637387561223561021318182129029137495;
    uint256 constant IC1y = 8606739817302202620266916437252372535438467718271161923988618179567712759185;
    
    uint256 constant IC2x = 7166207948390039732330140681875016591429285217310145959074738367145618797602;
    uint256 constant IC2y = 8159699107717163220673883316360373527019734320806282801031221894789800949556;
    
    uint256 constant IC3x = 11111083133328634053273803858755651490689644640158633836963917653123645984261;
    uint256 constant IC3y = 4878931791088545495582042856112910009204930553773863182853836881944696722300;
    
    uint256 constant IC4x = 18136615581213008544573219323125368203670628193041265834361500172979352984637;
    uint256 constant IC4y = 18064756256352546388034258038467625606443352600668768787142252861657268914086;
    
    uint256 constant IC5x = 15719598488328232243702617682776654160926801529566624994822398193303021941394;
    uint256 constant IC5y = 17796149362592479628797189891692129061094898611878897017884966324687172672119;
    
    uint256 constant IC6x = 5762626854523822487514945262951656070006996530131122600273828536761186708408;
    uint256 constant IC6y = 17319934310600245002194543368988010823955683530941174520361988096091353367052;
    
    uint256 constant IC7x = 16456418495421128057347848927869685500661366933656005166883017866361652378497;
    uint256 constant IC7y = 8367442716854335338364996229721668244368810287825750828883245396288255646931;
    
    uint256 constant IC8x = 8883166179101714475292940664215689871115619983156260074821974032806879858215;
    uint256 constant IC8y = 19888391717183038701628272373697985362676945179141516401518375964043303171501;
    
    uint256 constant IC9x = 12493083179412982160310522483252164226845432068503781348537740485226919949894;
    uint256 constant IC9y = 20935141743970765297386389675632205971194442355350293794020855435165166636;
    
    uint256 constant IC10x = 4428160265607548290321426112522957293621874348335703805980200376335592280142;
    uint256 constant IC10y = 11684548067788382156089384296002205778780894715986503578131189845463213615894;
    
    uint256 constant IC11x = 13535763319724211246332843699256179281606531399009630794023120542429938776950;
    uint256 constant IC11y = 8819868256884732197575114563400520745216275309563071846559945598167720624499;
    
    uint256 constant IC12x = 19677415833225743684182079404802115573746436954389640474814873017052671655972;
    uint256 constant IC12y = 17280237512529185956729283219349132943201213019665008107537984709551254528345;
    
    uint256 constant IC13x = 18279960923569486717919114734567876495389420485599469285700093418601778885893;
    uint256 constant IC13y = 9227398436179368544983237349386468613277557243297752679932321171986698246476;
    
    uint256 constant IC14x = 13188416848495796903109801215627496953796193468265664194144865306554987375179;
    uint256 constant IC14y = 16762691759570838324575821730447101033538722369502522818998635329961665630737;
    
    uint256 constant IC15x = 178565477829483350643148144829757413935786606323262917927639799971699109818;
    uint256 constant IC15y = 10265183840310113681130256481804275098194550998199117767297876630542126169465;
    
    uint256 constant IC16x = 11245656402783367185626058269006273385219458168229461585228256155964115762958;
    uint256 constant IC16y = 10031407271094139239285878687960724124496541243168042026846043998524203214166;
    
    uint256 constant IC17x = 14925672987119077005212704175619007401878655653543595831465003634636447221816;
    uint256 constant IC17y = 1419133439159465457606186921000783855146157806945564702562206768766745246489;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[17] calldata _pubSignals) public view returns (bool) {
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
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                

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
            
            checkField(calldataload(add(_pubSignals, 480)))
            
            checkField(calldataload(add(_pubSignals, 512)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
