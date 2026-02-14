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
    uint256 constant deltax1 = 11908592976308929014212881373961785148444720840525794848681111920011055115243;
    uint256 constant deltax2 = 16271269588693558863264595529005991522336983963141923242937577472280523061901;
    uint256 constant deltay1 = 20907609472085511634929518658204954487762170583129067447218655201897953853373;
    uint256 constant deltay2 = 982671484319104205615777447462201807470364622420776878957521231583656843495;

    
    uint256 constant IC0x = 13295970225787297833739623885174734601273797990509243735339156828522551729755;
    uint256 constant IC0y = 5508545736819385924864053490025042099555695066420708453952039510388407671794;
    
    uint256 constant IC1x = 16723931583233872711043171816867071244182025549771691221896213433608924897932;
    uint256 constant IC1y = 325294296365862346148472387116944986490134522661787779443023916094712486635;
    
    uint256 constant IC2x = 19074558857434340543853733342790822075387654607627853597000736387589044470724;
    uint256 constant IC2y = 11408668116598349497289661198191896964996178292251770474835445829059515673999;
    
    uint256 constant IC3x = 8397419284851746554812326439171708900017941147989662423915894012528877363833;
    uint256 constant IC3y = 7911250483776504501654116026460873489054719309620917966674302512591699120235;
    
    uint256 constant IC4x = 7589124079672057134388398327374849369642968990922822040668230950352950860047;
    uint256 constant IC4y = 13156889423090916085955803254762003866430329545906101350235974325333548571796;
    
    uint256 constant IC5x = 5549737964718385275148991034920179381252357327341348077948558960987393003933;
    uint256 constant IC5y = 17757221608381001259211714351085527619523201099420874631850348792922470294456;
    
    uint256 constant IC6x = 3991009861267351523511499493475246471886774943726983883321502999573183972112;
    uint256 constant IC6y = 9348269531990040578841828735122086281552234686420193377232299338273378254735;
    
    uint256 constant IC7x = 15162391889577670482892698105239895710087674161627619805222610051573986868543;
    uint256 constant IC7y = 1753309135572463933655419717358178445892463995176875838272883573718008781994;
    
    uint256 constant IC8x = 12857306305580750163448414853681320719715526262118509355161525205718091454754;
    uint256 constant IC8y = 15223076430305826957310324432365558886027869011998558079060141436484893946858;
    
    uint256 constant IC9x = 3605586231009492014093087958334210795466986734325502266707318366493741930211;
    uint256 constant IC9y = 20967973583003801171636099145085822180415210759759348265777424153549039009964;
    
    uint256 constant IC10x = 6159444435245961967736171353600664912092521634687023093514212178782905863047;
    uint256 constant IC10y = 6847566153268841926028792977944303171727371078378989795647868223362640691258;
    
    uint256 constant IC11x = 1079135151352736202078438039919701614922709391734288235797496168559899863805;
    uint256 constant IC11y = 4738721549027436769679225904444106189553491561616577268714457535046670529448;
    
    uint256 constant IC12x = 3694481382262564614932735183342481440812157773555458346858922584124233978530;
    uint256 constant IC12y = 6512900289896496313182826589015433038369455900741913240752532169329730901045;
    
    uint256 constant IC13x = 1580370202166963094244925076167698065125817585658788450716108062210810670039;
    uint256 constant IC13y = 7722058921312326436165316148830276419116162292484860942106791676079965086659;
    
    uint256 constant IC14x = 12591638735446916051684989284620995503340068860104706347620907300716346807272;
    uint256 constant IC14y = 4565485334564171217848104826304841508422101457505623403573345861993168338681;
    
    uint256 constant IC15x = 11712116712414432801624477125717681746962021022340465177880290106399936096465;
    uint256 constant IC15y = 18414151641705530299037898897409289858378630727988044455162092748808977380250;
    
 
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
