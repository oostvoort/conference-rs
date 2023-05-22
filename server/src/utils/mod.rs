use log::info;
use rand::Rng;
use std::env;

pub fn get_env(key: &str, default: &str) -> String {
    // Check .env file
    match dotenvy::var(key) {
        Ok(v) => return v,
        Err(_) => {
            // Check linux env
            match env::var(key) {
                Ok(v) => return v,
                Err(_) => {
                    // def
                    info!("{key} not provided, defaulting to {default}");
                    default.to_string()
                }
            }
        }
    }
}

/// generates random name for instances when the client does not provide a display_name
pub fn gen_random_name() -> String {
    let names = vec![
        "Cheddar",
        "Swiss",
        "Gouda",
        "Brie",
        "Camembert",
        "Roquefort",
        "Blue cheese",
        "Parmesan",
        "Gruyere",
        "Emmental",
        "Feta",
        "Ricotta",
        "Mozzarella",
        "Provolone",
        "Fontina",
        "Monterey Jack",
        "Colby",
        "Pepper Jack",
        "Havarti",
        "Munster",
        "Limburger",
        "Cottage cheese",
        "Cream cheese",
        "Cheshire",
        "Lancashire",
        "Stilton",
        "Wensleydale",
        "Red Leicester",
        "Double Gloucester",
        "Caerphilly",
        "Pecorino Romano",
        "Asiago",
        "Manchego",
        "Halloumi",
        "Comte",
        "Beaufort",
        "Reblochon",
        "Tomme de Savoie",
        "Raclette",
        "Morbier",
        "Chevre",
        "Gorgonzola",
        "Dolcelatte",
        "Taleggio",
        "Bel Paese",
        "Tete de Moine",
        "Boursin",
        "Roquefort",
        "Fourme d'Ambert",
        "Bleu d'Auvergne",
    ];
    let index = rand::thread_rng().gen_range(0..names.len());
    names.get(index).unwrap().to_string()
}
