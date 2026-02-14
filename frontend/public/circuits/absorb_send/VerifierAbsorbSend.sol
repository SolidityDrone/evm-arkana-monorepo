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
    uint256 constant deltax1 = 11252279874193813234220022164400817201669127905347142108521402328532082815063;
    uint256 constant deltax2 = 1673593739316248393190111964223876903060111392420165284398594684358412447276;
    uint256 constant deltay1 = 13839764709225942452204612219205938885273868033201909277821765365573330871140;
    uint256 constant deltay2 = 3768559789025659527959814411518584095602043971165083378898937306674097815759;

    
    uint256 constant IC0x = 7099568003035673707001158894973688937818837671853425872171250264087144307058;
    uint256 constant IC0y = 13767483751066007030590281743698241103749176821091118664947951286681220475150;
    
    uint256 constant IC1x = 3036631092181922287201033261856496214059917708351536930382191639637808303737;
    uint256 constant IC1y = 1189968114665895698768552939707232652091472151457396728092866387673828675679;
    
    uint256 constant IC2x = 3248167884170642442666876966469439273378926787056646826777806475317165410589;
    uint256 constant IC2y = 19274748092004472934507662332545045011371120935223037572497915666887788453515;
    
    uint256 constant IC3x = 19241809950869416556468235625883768698422087738595001495848439391375230909465;
    uint256 constant IC3y = 5356508837894794058587521761881497355063382352838191680421938084457315248946;
    
    uint256 constant IC4x = 3691062994864679571082584902313955098550369948443787944023858161283186406551;
    uint256 constant IC4y = 4503768928904043910780126999795502352901610359012678590177492884137675886268;
    
    uint256 constant IC5x = 8234322623807579541174768941557297997003587958339440144393566767415377596988;
    uint256 constant IC5y = 1968723866551111326998718431946512823207121701809794881715013155616348401903;
    
    uint256 constant IC6x = 12468665693928252246532978005807074230939067714328920232558436404271480406561;
    uint256 constant IC6y = 432180018279669266996078436015978643389824193692987797279570736810511373086;
    
    uint256 constant IC7x = 5295377572068483423346319058065411971845962305960882551731756744413514903090;
    uint256 constant IC7y = 20540369089864345455190230303017833883191879248644401685601721627515926400463;
    
    uint256 constant IC8x = 14283334514072072358616967536349899447025576331744145642799413610150740999619;
    uint256 constant IC8y = 6651858314693015952790427512484990206528500039022883247916078480350818659863;
    
    uint256 constant IC9x = 9198810494730975951257202910580340208660859965004068139453538058608242505503;
    uint256 constant IC9y = 13325986677227496043185168990221522054999846949870005376962288340897569174489;
    
    uint256 constant IC10x = 20088789570679598105073348812984163974372676630370606168977932409149075280129;
    uint256 constant IC10y = 6186648333466580063115920801291868498011159035042484064039532546943819689921;
    
    uint256 constant IC11x = 9932163387749634770155173362824259909143378869969750969796885031331854317677;
    uint256 constant IC11y = 301527808123829912270889463365289619995228564236800607711197953332448352625;
    
    uint256 constant IC12x = 17066861667996347956746957976206840041303731218226166954657684376703765547646;
    uint256 constant IC12y = 13361989575404461286455174664879946337827945267232364916450650427754688708298;
    
    uint256 constant IC13x = 14803845539337633497882852010103102480058583445313170101208833085409682805153;
    uint256 constant IC13y = 21346700141243983894920176080145185354076227191980031221201110896800034891557;
    
    uint256 constant IC14x = 3467606973218160255915226077386286033574640903042998738649289275404652916908;
    uint256 constant IC14y = 10793516523054728708203516388873140806785530639687548934416369945415153356774;
    
    uint256 constant IC15x = 17967492566814375751627680464159412838694144456300316841153283007325663673502;
    uint256 constant IC15y = 17452855848612082621474642185543958630137108536036734458373058038001010342992;
    
    uint256 constant IC16x = 14810715939662388451041222295406580603546611545679014839988623466223843767426;
    uint256 constant IC16y = 1998837270342161148257302727707809143362935971538125733750066066538556001368;
    
    uint256 constant IC17x = 10358497331267857442885581755789903754130103968928913803268057814719630338869;
    uint256 constant IC17y = 9053477386045694673422418354290373538713044260129546486813666617175489409623;
    
 
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
