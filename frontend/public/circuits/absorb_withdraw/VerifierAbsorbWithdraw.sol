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
    uint256 constant deltax1 = 20055224531910218431776134292413797180382000071064242848943951235121633402737;
    uint256 constant deltax2 = 5334322850470624698205267802253507268160009961128697589349717135949917703761;
    uint256 constant deltay1 = 20026772848342276312951934471780779903973467103130967471327721560769276112016;
    uint256 constant deltay2 = 8981090328782350594124373618492471240756673864088606668891677735370653844354;

    
    uint256 constant IC0x = 3342155499406079746771518573237735804741510675695518647468481829819018787999;
    uint256 constant IC0y = 1946095659038209964996674873989975322303318205633530795292839869533144714001;
    
    uint256 constant IC1x = 16970957489094895704416256727786573640565498075472239747121029740695274517848;
    uint256 constant IC1y = 4662302988426192183813251239393657103399477896698315784561955280101244542536;
    
    uint256 constant IC2x = 10667067277784374183721200435488508176637683020243483910273980131907413212428;
    uint256 constant IC2y = 117594651216333784108136700082315676042373278042649605320899945445252940889;
    
    uint256 constant IC3x = 9428239089418501480778678309094270416874314032312770239585862602910298808550;
    uint256 constant IC3y = 8015603161616736559633144635831733861287803707194436240321139208828621996601;
    
    uint256 constant IC4x = 8951815595025679762435061013599990711284142506894604049655255706009842844213;
    uint256 constant IC4y = 12829116485172209015017066185209612619031951672941156328179478268525211599180;
    
    uint256 constant IC5x = 4671552142335515072976024196206277314733671017037921366338439443956274608868;
    uint256 constant IC5y = 8108328017222560720452468115676873789991978649153378438472837440323045241369;
    
    uint256 constant IC6x = 15774904263170128645329832953939741356119091292545546380740815910451230666601;
    uint256 constant IC6y = 20214814802236924299226684410004129188215948939810471211753396171829972964801;
    
    uint256 constant IC7x = 5284172594349905009270704630470692993468110189014964289593995121576651264358;
    uint256 constant IC7y = 12475552989372872364431710634508903924398249231424439259197392613650881219292;
    
    uint256 constant IC8x = 13574561540282547281961227494451389712770141362898266280219038429672121375847;
    uint256 constant IC8y = 10103899629984195734389762878672824608573919530712555211898362172397233618609;
    
    uint256 constant IC9x = 18048704134699771094770524578394481239159700652594451113137605219241297544080;
    uint256 constant IC9y = 5445499089664834551229951374015754379287928022425434176232630665279460724964;
    
    uint256 constant IC10x = 11793052998243314186855949159515843682769960171068846480180447948594955267802;
    uint256 constant IC10y = 12820586401851333328661970311947067670069162446693955423404341074703556034713;
    
    uint256 constant IC11x = 6021501221195295441133344179925559781537015256283346430977095632703077919862;
    uint256 constant IC11y = 21328706396947659797494869536553448251820989562530646495166722727469088522984;
    
    uint256 constant IC12x = 7671595279343328753275474986844667998483946168430514825912571774193176732001;
    uint256 constant IC12y = 6073276174146772926750853004624923976034579314693401325927365242900886308242;
    
    uint256 constant IC13x = 12858271500714060147000780785876385220286996679457388644947097515836370012028;
    uint256 constant IC13y = 14592840584878761260100586033583822759854144938234222616348774868116600130580;
    
    uint256 constant IC14x = 21392780534007570656425932551745549774040415000136295013241147677561800976553;
    uint256 constant IC14y = 8604260151133107951849107947966414761995243918420749435733655829425677060215;
    
    uint256 constant IC15x = 2150680588530618142248439904636788275407111717084243654015464500418008865527;
    uint256 constant IC15y = 16265283153405115727095893351157126498821695149643387357046602736694220043219;
    
 
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
