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
    uint256 constant deltax1 = 18153388220455048363606432543575578897374180298532799090671615997415798436639;
    uint256 constant deltax2 = 10811546967708447265061832452712500776700038302757496142314775113713577398960;
    uint256 constant deltay1 = 15700931592647651717098760473661260483323549592651126675519661890422549636908;
    uint256 constant deltay2 = 17346110464022724122426312552058307771946000664870719134255948384972337329501;

    
    uint256 constant IC0x = 12300564811441987401849536427209318446240201806579801362699400119650469344546;
    uint256 constant IC0y = 19274616800151610956804665815323565114373295082656020407865943775579658720741;
    
    uint256 constant IC1x = 17810598084625790103974024819343280755334688761062260011790603730109012827305;
    uint256 constant IC1y = 2661758399865648586296435516712080344661397496201796954051877187827122651654;
    
    uint256 constant IC2x = 6872470373479059575808880963894225799550193685715296382213589419936167594854;
    uint256 constant IC2y = 7195846404286973191170748256590517298124814646993327215556919026554507405996;
    
    uint256 constant IC3x = 15728672998309899545368129082940749518791710954802829928963835237550683810427;
    uint256 constant IC3y = 20035554962943001725125784667791688125328179523441640838654964907327001391343;
    
    uint256 constant IC4x = 19011590924215671430404415384233124166433430690560142266954386524159568930479;
    uint256 constant IC4y = 16614495090785476534822104725297227867512053393830882796886403835679968383469;
    
    uint256 constant IC5x = 21335331110421574845413510887597960358069174195425513505190517966803019387605;
    uint256 constant IC5y = 15215657935634978240247508995278789448547312535537340636757041062779725205331;
    
    uint256 constant IC6x = 13516960478540847715742797767961259735601790891685955830643969007168001413808;
    uint256 constant IC6y = 5418689687682318436656116542315703788735455951264234977569342245687204061929;
    
    uint256 constant IC7x = 1033456019987613337674733632081077573591962743338195301496343690261767893280;
    uint256 constant IC7y = 9709120205872949991646440321790464509269273565662048233968118690837092074833;
    
    uint256 constant IC8x = 19745609848747349800501248960391068517897642572076479178564099995917132077134;
    uint256 constant IC8y = 5151662254370081813421589223248551127486519272772047240262177398289485327224;
    
    uint256 constant IC9x = 959824324417819105599393809093343276800677018798116020408734059546236173650;
    uint256 constant IC9y = 2891863420110673612341378014964250464886964706007212235573613103093603590713;
    
    uint256 constant IC10x = 5717390403587854755990842158428782409218781470117030741895893653433629725804;
    uint256 constant IC10y = 19015875842335084555341555484800848746991208149278367422571377584403662404368;
    
    uint256 constant IC11x = 13489326320948363798635260638179511134738582950201057771944260960009279384110;
    uint256 constant IC11y = 15240382230441657541961083264885438896619812756719033812708143234314054168494;
    
    uint256 constant IC12x = 7850152079117589232476062481287181350955689379181433181854993327166777049925;
    uint256 constant IC12y = 15791318651754946889488517535336191806454258630122442957405656152795362225836;
    
    uint256 constant IC13x = 15805804608148808341359158315290790775406153848107640585923480654413450800620;
    uint256 constant IC13y = 21845837419539085571619015033627108888963920832865489226751428781583940943374;
    
    uint256 constant IC14x = 20726521685709684703724120431534046711988592667240083450085851080319467566419;
    uint256 constant IC14y = 1474761193422844770598266153706604125566423925533899230548081730043043996872;
    
    uint256 constant IC15x = 9865069561023459022300735341475939561747175820231227575190769913820413055164;
    uint256 constant IC15y = 17150922248665762541057012256153564788969938883372523803369104356293873410436;
    
 
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
