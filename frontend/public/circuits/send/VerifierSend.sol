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
    uint256 constant deltax1 = 20821809601296470873027062565056442185435126494309223797133168151582857963732;
    uint256 constant deltax2 = 14975806520423506811777399128859707925176185517548113235282028853353419160628;
    uint256 constant deltay1 = 19766373047394806706913163999020191975495935588055464908189326501330108049244;
    uint256 constant deltay2 = 15263700388608846425858072973648977137203770004670704975822441063169862777113;

    
    uint256 constant IC0x = 17032441841437516570143621540456674639709771529960360811573122422259102427697;
    uint256 constant IC0y = 1559626516627963535732143117962986421457434492080202698758590617770093834739;
    
    uint256 constant IC1x = 5830750927043656878982701270175297925190212414346039893377512145948921506126;
    uint256 constant IC1y = 7310903310772730903525642054222807553601003673667164371564032687823056391826;
    
    uint256 constant IC2x = 12415531586614100414477440090033710549861376643425445328427092131898937889382;
    uint256 constant IC2y = 21825144998020849880600303458263425285815625254768448563179104357140889964221;
    
    uint256 constant IC3x = 21515698263628384345476942186953824214260641169845009926038865100137803136002;
    uint256 constant IC3y = 12180225999249762564341723403231605807366093819947697292152281878113862282170;
    
    uint256 constant IC4x = 6591392998326334032672611259231409809997783962584387190961005097743472360368;
    uint256 constant IC4y = 14386860376731600285256827191822936821559638757131087851125218407734916068906;
    
    uint256 constant IC5x = 21535970324481096139152681229669681048355128173928184990072783143391786626458;
    uint256 constant IC5y = 1035325221075561086558642941896792595125730545934831468204845499097274089373;
    
    uint256 constant IC6x = 3141717320438453475550325400232538156060577218149420978318200985414899607221;
    uint256 constant IC6y = 8353580308234152736634523142280000843463980727078095224516148614204617878910;
    
    uint256 constant IC7x = 5070458366446230167544690263362426546117532056294789656420203364113816451131;
    uint256 constant IC7y = 6651527451901891678435554096669342675894504076884482047473523127700706522281;
    
    uint256 constant IC8x = 7552708120594495129139577646952229301463477764164183614466588817233300795405;
    uint256 constant IC8y = 11295672956882383600180048819254358630018724072812293563204863679254970876842;
    
    uint256 constant IC9x = 3388143562138922421565698784790100682838075731757936423098415507489762783793;
    uint256 constant IC9y = 2509007848191659179102112757967108487259889217863042268197277519861228418141;
    
    uint256 constant IC10x = 3873978004562561640617099653369079310352739812679665017829226702347131020228;
    uint256 constant IC10y = 4687611769107953984175964254197343434896750698885171482698682662065848714293;
    
    uint256 constant IC11x = 10669478280221386950842984858823779885922804191328880341589646149700202594663;
    uint256 constant IC11y = 8439172124317718560660816477065758420171356108893479306165651150860070412155;
    
    uint256 constant IC12x = 16983887803904746626258902877412699963224786226713265605515826200176714359904;
    uint256 constant IC12y = 15027954522417260167683386094995060365008648391779976228165778012485051773535;
    
    uint256 constant IC13x = 21869402796406925406794427627082002594798574527219428748584807486976273658878;
    uint256 constant IC13y = 12979070232933897864001923226423791442250001728473277657983312833798978405081;
    
    uint256 constant IC14x = 14410576697652701452155082901411683326106333991922359326394384784714364409971;
    uint256 constant IC14y = 889224928571463445986998056414604408823877475368480487953732164834733153924;
    
    uint256 constant IC15x = 8075759051335107607982278106878081044168791517484126575233533640279112141845;
    uint256 constant IC15y = 19007204533200707872872484093431707059895510699216927151775865357642906720164;
    
    uint256 constant IC16x = 13083431722542826436224382841615189774432886036617179397980922379383197783051;
    uint256 constant IC16y = 14961082741969760323144790874825378167559527470983167490391055013235442973123;
    
    uint256 constant IC17x = 21637152309491196914505482434043157172624427675392061194920663778548361325267;
    uint256 constant IC17y = 12577427787796901304591224457235420953503540805050732008106965778738044329832;
    
 
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
