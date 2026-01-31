pub mod pedersen_commitments;


// Export the main functions
pub use pedersen_commitments::{
    pedersen_commitment,
    add_commitments,
    subtract_commitments,
    verify_commitment_opening
};

