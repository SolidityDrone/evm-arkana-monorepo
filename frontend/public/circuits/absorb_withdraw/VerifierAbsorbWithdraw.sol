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
    uint256 constant deltax1 = 17532267454225804251314976419341776247295790052315067339025132043219783529373;
    uint256 constant deltax2 = 2333012543063942062327178178298806532260356304386719989689009664674741796682;
    uint256 constant deltay1 = 14651008348430789104006948771322655267467086769967644894547043802907371012402;
    uint256 constant deltay2 = 14890208276516436399115475445681691470918571974255731553192643877425986111945;

    
    uint256 constant IC0x = 3290398539996879057446157226219972313286356089113774211139641421388617940256;
    uint256 constant IC0y = 9609380446270940208951602305588496007256964617283588664952965275584886463703;
    
    uint256 constant IC1x = 282828790392386213009738385713229400239573092951772301731661770860528845676;
    uint256 constant IC1y = 2629754682095395285783575106509112118725748414700653949785707786078365298244;
    
    uint256 constant IC2x = 20042637931634091119696302777924657069818801079659823113590968412697968548813;
    uint256 constant IC2y = 12794019132922076724975390921479195733512137238087802993082109998893745113988;
    
    uint256 constant IC3x = 5665857184537023058575083990799498255733109007278294108530890265938660899571;
    uint256 constant IC3y = 4507170573775092003868267066293560227139282478068683527404873864361839319783;
    
    uint256 constant IC4x = 16127033640599919861808312983082318528882754614063870285626900997310701383768;
    uint256 constant IC4y = 17861885466625431250311552472411188894242434637583484485399865574729727810612;
    
    uint256 constant IC5x = 12095337019399368780563109947623709609036370122075364825863940185111039387358;
    uint256 constant IC5y = 13135513137934988330371477763257624891244451823716671898085934901346866272666;
    
    uint256 constant IC6x = 3272076770106450328221572796179570026349844521908056752062100615871202172752;
    uint256 constant IC6y = 19349389602476364116998396812568259418836514903204770834934370438696910150305;
    
    uint256 constant IC7x = 11575237712868446542726959486363413018389872478495128771089603588288250886223;
    uint256 constant IC7y = 19870286011098245260738029483974901710280186946969247671723483593284019647124;
    
    uint256 constant IC8x = 8800912901544249855225021831051321431290651428266894104240103678277391684684;
    uint256 constant IC8y = 15555289289277626391248710888810152213181402059175174049542550107887162968966;
    
    uint256 constant IC9x = 16780354831178295851635045226817052929221902921526789222050191087309363476576;
    uint256 constant IC9y = 9534468417940270277434371065560378224304695851609062655889788329193495147073;
    
    uint256 constant IC10x = 12179345363086050347722720093435973114344322524695080300229850371545148516956;
    uint256 constant IC10y = 14317015214159286804211310232758567934502215709479870074761275246818936012814;
    
    uint256 constant IC11x = 18764338859328029954619878898781489233463307440086047244069808871879912845203;
    uint256 constant IC11y = 12436230496275262029379437145860262740859310018273865215030937360025041266876;
    
    uint256 constant IC12x = 20591689084341833821715745633438063642820739768822349928362603165492885205891;
    uint256 constant IC12y = 20140150644974103718273328564018428479818975405695064029256372849333621346605;
    
    uint256 constant IC13x = 3352649284523101849181531177377781549317011016738963821402965104872809582481;
    uint256 constant IC13y = 528320788056845879649477032450439970661096214935489265760784627283751533256;
    
    uint256 constant IC14x = 16775935356364689445660327493016888085993374254904058885783477522209856105416;
    uint256 constant IC14y = 8186495859258379147315333560686090246011109393862960516868096863666534922065;
    
    uint256 constant IC15x = 5018712769738906923135862990986168925172191159512376928186047647832082024510;
    uint256 constant IC15y = 6582923317992396209601839279724825593714895214317973368929435798398729969042;
    
 
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
